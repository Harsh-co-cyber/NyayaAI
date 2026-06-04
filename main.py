"""
FastAPI Backend for BNS Section Retrieval + FIR Generation
Uses RAG (Retrieval-Augmented Generation) for improved accuracy
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from collections import Counter
import re
from datetime import datetime
from openai import OpenAI
import os
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="BNS Section Retrieval & FIR Generation API",
    description="RAG-based system for suggesting applicable BNS sections and generating FIR documents",
    version="2.0.0"
)

# Add CORS middleware to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QueryRequest(BaseModel):
    query: str

class SectionSuggestion(BaseModel):
    section_id: str
    section_name: str
    law_type: str  # "BNSS"
    category: str
    severity: str
    keywords: str
    description: str
    score: float

class QueryResponse(BaseModel):
    sections: list[SectionSuggestion]
    category: str
    message: str

class FIRRequest(BaseModel):
    query: str
    section_ids: list[str] = None

class FIRResponse(BaseModel):
    fir: str
    sections: list[str]
    category: str



# Global variables for databases
embedding = None
bns_db = None
bnss_db = None
client = None
bns_lookup = {}   # section_id -> full row dict
bnss_lookup = {}  # section_id -> full row dict

def initialize_system():
    """Initialize embeddings, vector databases, and LLM client"""
    global embedding, bns_db, bnss_db, client, bns_lookup, bnss_lookup
    
    print("Initializing embedding model...")
    embedding = HuggingFaceEmbeddings(
        model_name="BAAI/bge-base-en-v1.5",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

    def load_csv_to_db(csv_file, law_type, persist_dir, collection_name, lookup_dict):
        """Helper to load a CSV into a Chroma vector DB and populate lookup."""
        df = pd.read_csv(csv_file, encoding="utf-8", quoting=0, on_bad_lines="warn")
        df = df.fillna('')
        print(f"✓ Loaded {len(df)} {law_type} sections")

        for _, row in df.iterrows():
            lookup_dict[str(row["Section"]).strip()] = str(row["Description"]).strip()

        texts, metadatas = [], []
        for _, row in df.iterrows():
            text = f"""{law_type} Section {row['Section']}: {row['Section _name']}

Chapter: {row['Chapter_name']}
Category: {row['Chapter_subtype']}
Severity: {row['Severity']}

Legal Provision:
{row['Description']}

Keywords: {row['Keywords']}

Common Scenarios:
{row['Common_Scenarios']}

Related Sections: {row['Related_Sections']}

Search Terms: {row['Search_Text']}"""

            metadatas.append({
                "section_id": str(row["Section"]).strip(),
                "section_name": str(row["Section _name"]),
                "chapter": str(row["Chapter_name"]),
                "category": str(row["Chapter_subtype"]),
                "severity": str(row["Severity"]) or "Medium",
                "keywords": str(row["Keywords"]),
                "common_scenarios": str(row["Common_Scenarios"]),
                "related_sections": str(row["Related_Sections"]),
                "law_type": law_type
            })
            texts.append(text.strip())

        if os.path.exists(persist_dir):
            print(f"Loading existing {law_type} database...")
            db = Chroma(
                embedding_function=embedding,
                persist_directory=persist_dir,
                collection_name=collection_name
            )
            try:
                existing_count = db._collection.count()
            except Exception:
                existing_count = 0
            if existing_count == 0:
                print(f"Existing {law_type} database is empty. Rebuilding from CSV...")
                db = Chroma.from_texts(
                    texts=texts,
                    metadatas=metadatas,
                    embedding=embedding,
                    persist_directory=persist_dir,
                    collection_name=collection_name
                )
        else:
            print(f"Creating {law_type} vector database...")
            db = Chroma.from_texts(
                texts=texts,
                metadatas=metadatas,
                embedding=embedding,
                persist_directory=persist_dir,
                collection_name=collection_name
            )
        print(f"✓ {law_type} database ready")
        return db

    # ========== Load BNS (Bharatiya Nyaya Sanhita) ==========
    bns_db = load_csv_to_db(
        "bns_sections_enhanced.csv", "BNS",
        "bns_dbs_enhanced", "bns_sections_enhanced",
        bns_lookup
    )

    # ========== Load BNSS (Bharatiya Nagarik Suraksha Sanhita) ==========
    bnss_db = load_csv_to_db(
        "bnss_sections_enhanced.csv", "BNSS",
        "bnss_dbs_enhanced", "bnss_sections_enhanced",
        bnss_lookup
    )

    # Initialize OpenAI client for LM Studio
    client = OpenAI(
        base_url="http://127.0.0.1:1234/v1",
        api_key="lm-studio"
    )
    print("✓ System initialized successfully")

def retrieve_relevant_sections_enhanced(query, top_k=10):
    """
    Retrieves both BNS (substantive law) and BNSS (procedural law) sections.
    Returns top 5 BNS + top 5 BNSS results.
    """
    # Retrieve from both databases
    bns_results  = bns_db.similarity_search_with_score(query, k=top_k)
    bnss_results = bnss_db.similarity_search_with_score(query, k=top_k)

    query_lower = query.lower()

    crime_keywords = {
        'sexual': {
            'keywords': ['sexual', 'rape', 'molest', 'harass', 'assault', 'inappropriate',
                        'touch', 'consent', 'grope', 'fondle', 'indecent', 'modesty'],
            'boost': 0.20
        },
        'theft': {
            'keywords': ['theft', 'steal', 'stole', 'stolen', 'rob', 'burglary', 'took',
                        'missing', 'loot', 'pilfer', 'snatch'],
            'boost': 0.15
        },
        'violence': {
            'keywords': ['murder', 'kill', 'hurt', 'injure', 'assault', 'attack', 'beat',
                        'stab', 'shoot', 'wound', 'grievous', 'death'],
            'boost': 0.20
        },
        'fraud': {
            'keywords': ['fraud', 'cheat', 'deceive', 'forgery', 'counterfeit', 'fake',
                        'scam', 'swindle', 'embezzle'],
            'boost': 0.15
        },
        'property': {
            'keywords': ['property', 'damage', 'mischief', 'trespass', 'house', 'building',
                        'vandalism', 'destruction'],
            'boost': 0.12
        },
        'cyber': {
            'keywords': ['cyber', 'computer', 'digital', 'online', 'internet', 'hack',
                        'phishing', 'electronic', 'data'],
            'boost': 0.15
        },
        'kidnapping': {
            'keywords': ['kidnap', 'abduct', 'ransom', 'child', 'missing person', 'taken',
                        'forcefully'],
            'boost': 0.18
        },
        'dowry': {
            'keywords': ['dowry', 'husband', 'in-laws', 'torture', 'cruelty', 'marriage',
                        'wife', 'harassment'],
            'boost': 0.18
        }
    }

    def score_results(results):
        section_data = []
        seen = set()
        for doc, score in results:
            sec_id   = str(doc.metadata.get("section_id"))
            law_type = doc.metadata.get("law_type", "BNS")
            key      = f"{law_type}_{sec_id}"
            if key in seen:
                continue
            seen.add(key)

            section_text = doc.page_content.lower()
            keywords     = doc.metadata.get("keywords", "").lower()
            scenarios    = doc.metadata.get("common_scenarios", "").lower()
            severity     = doc.metadata.get("severity", "Low")

            boost = 0
            for category, info in crime_keywords.items():
                kw_list     = info['keywords']
                boost_value = info['boost']
                q_matches   = sum(1 for kw in kw_list if kw in query_lower)
                s_matches   = sum(1 for kw in kw_list if kw in section_text or kw in keywords or kw in scenarios)
                if q_matches > 0 and s_matches > 0:
                    boost += boost_value * min(q_matches, s_matches) / len(kw_list)

            scenario_list    = scenarios.split('|')
            scenario_matches = sum(1 for s in scenario_list if any(w in s for w in query_lower.split() if len(w) > 3))
            if scenario_matches > 0:
                boost += 0.10 * min(scenario_matches / len(scenario_list), 1.0)

            if severity == "High" and any(w in query_lower for w in ['murder', 'rape', 'kill', 'death', 'kidnap', 'sexual']):
                boost += 0.08

            query_words   = set(query_lower.split())
            keyword_words = set(keywords.split(','))
            direct_matches = len(query_words.intersection(keyword_words))
            if direct_matches > 0:
                boost += 0.05 * min(direct_matches / 3, 1.0)

            lookup = bns_lookup if law_type == "BNS" else bnss_lookup
            section_data.append({
                'text': doc.page_content,
                'section_id': sec_id,
                'law_type': law_type,
                'category': doc.metadata.get("category"),
                'section_name': doc.metadata.get("section_name"),
                'severity': severity,
                'keywords': keywords,
                'scenarios': scenarios,
                'related_sections': doc.metadata.get("related_sections", ""),
                'description': lookup.get(sec_id, ""),
                'score': score - boost,
                'original_score': score,
                'boost': boost
            })
        return sorted(section_data, key=lambda x: x['score'])

    bns_data  = score_results(bns_results)
    bnss_data = score_results(bnss_results)

    # Return top 5 from each
    return bns_data[:5] + bnss_data[:5]


def infer_category_from_sections(categories):
    """Infer crime category from retrieved sections."""
    if not categories:
        return "Unknown offence category"
    return Counter(categories).most_common(1)[0][0]

def clean_llm_output(text):
    """Clean LLM output by stripping reasoning markers and internal thoughts.

    The model sometimes outputs its entire chain-of-thought. Remove all of it
    to leave only the final summary.
    """
    # remove balanced tags
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    text = re.sub(r"<reasoning>.*?</reasoning>", "", text, flags=re.DOTALL)
    # also drop any unclosed tags
    text = re.sub(r"<think[^>]*>", "", text)
    text = re.sub(r"<reasoning[^>]*>", "", text)

    # remove leading reasoning preambles
    text = re.sub(
        r"^(?:Alright,|OK,|Okay,|First,|Maybe,|Let me|I need|I should|I will|Suppose)[^\.]*\.[\s\n]*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # remove first-person reasoning sentences anywhere
    text = re.sub(
        r"\b(?:I need|I should|I must|I will|I think|I am|I have|Let me|Need to|Should|The user|The prompt|The task)[^\.]*\.[\s\n]*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # strip markdown bold/italic markers
    text = text.replace('**', '').replace('*', '')

    return text.strip()


def extract_fir_details(query: str) -> dict:
    details = {}
    if not query:
        return details

    # Extract complainant name from first-person phrases like "I, Shubhash" or "I am Shubhash"
    name_match = re.search(r"\bI\s*,\s*([A-Za-z][a-zA-Z]+(?:[\s-][A-Za-z][a-zA-Z]+)*)\b", query, flags=re.IGNORECASE)
    if not name_match:
        name_match = re.search(r"\bI\s+am\s+([A-Za-z][a-zA-Z]+(?:[\s-][A-Za-z][a-zA-Z]+)*)\b", query, flags=re.IGNORECASE)
    if name_match:
        details['complainant_name'] = name_match.group(1).strip()

    # Extract age or adult range information
    age_match = re.search(r"\bAge\s*(?:of)?\s*[:]?\s*([0-9]{1,2}(?:\s*–\s*[0-9]{1,2})?)\b", query, flags=re.IGNORECASE)
    if not age_match:
        age_match = re.search(r"\bAdult\s*\(?\s*([0-9]{1,2}–[0-9]{1,2})\s*\)?\b", query, flags=re.IGNORECASE)
    if age_match:
        details['complainant_age'] = age_match.group(1).strip()

    # Extract gender information from the complaint
    gender_match = re.search(r"\b(Male|Female|male|female|Man|Woman)\b", query)
    if gender_match:
        details['complainant_gender'] = gender_match.group(1).capitalize()

    # Extract address or place of occurrence
    addr_match = re.search(r"\b(at|located at|place of occurrence|place is)\s+([^.,\n]+)", query, flags=re.IGNORECASE)
    if addr_match:
        details['complainant_address'] = addr_match.group(2).strip()

    # Extract incident date and time if available
    date_match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", query)
    if date_match:
        details['incident_date'] = date_match.group(1)

    time_match = re.search(r"\b(\d{1,2}:\d{2})\b", query)
    if time_match:
        details['incident_time'] = time_match.group(1)

    return details


def is_valid_fir_output(text: str) -> bool:
    if not text or len(text.strip()) < 180:
        return False
    upper_text = text.upper()
    required_phrases = [
        'FIRST INFORMATION REPORT',
        'COMPLAINANT DETAILS',
        'APPLICABLE LEGAL SECTIONS',
        'ACTION TAKEN',
    ]
    return all(phrase in upper_text for phrase in required_phrases)


def generate_fir_template(query: str, sections_list: list[dict]) -> str:
    details = extract_fir_details(query)
    category = infer_category_from_sections([s['category'] for s in sections_list])
    section_lines = []
    for s in sections_list:
        section_lines.append(
            f"{s['law_type']} Section {s['section_id']} - {s['section_name']} ({s['category']})"
        )

    today = datetime.now().strftime("%d-%m-%Y")
    time_now = datetime.now().strftime("%H:%M")

    name = details.get('complainant_name', '[Not provided]')
    age = details.get('complainant_age', '[Not provided]')
    address = details.get('complainant_address', '[Not provided]')
    incident_date = details.get('incident_date', '[Not provided]')
    incident_time = details.get('incident_time', '[Not provided]')

    return f"""FIRST INFORMATION REPORT (FIR)
Under Bharatiya Nagarik Suraksha Sanhita, 2023

Date of Registration: {today}
Time of Registration: {time_now}
Police Station: [To be filled by station]

1. COMPLAINANT DETAILS:
   Name: {name}
   Age: {age}
   Address: {address}
   Contact: [Not provided]
   Occupation: [Not provided]

2. ACCUSED DETAILS:
   Name: Unknown
   Age (if known): Unknown
   Address (if known): Unknown
   Description: Unknown individual(s) suspected of committing the offence.

3. INCIDENT DETAILS:
   Date of Incident: {incident_date}
   Time of Incident: {incident_time}
   Place of Occurrence: {address}
   Incident Description: {query}

4. NATURE OF OFFENCE:
   Category: {category}

5. APPLICABLE LEGAL SECTIONS:
   {"\n   ".join(section_lines)}

6. DETAILED FACTS OF THE CASE:
   {query}

7. PROPERTY/LOSS (if applicable):
   [Property or loss details are based on the complaint and may require further verification.]

8. EVIDENCE/WITNESSES (if mentioned):
   [No explicit evidence or witnesses were mentioned in the complaint.]

9. ACTION TAKEN:
    FIR registered and investigation initiated.
"""


def generate_fir(query, sections_list):
    """Generate FIR document using retrieved sections."""
    section_text = "\n\n".join([s['text'] for s in sections_list])
    details = extract_fir_details(query)

    today = datetime.now().strftime("%d-%m-%Y")
    time_now = datetime.now().strftime("%H:%M")

    category = infer_category_from_sections([s['category'] for s in sections_list])

    detail_lines = []
    if details.get('complainant_name'):
        detail_lines.append(f"Complainant Name: {details['complainant_name']}")
    if details.get('complainant_age'):
        detail_lines.append(f"Complainant Age: {details['complainant_age']}")
    if details.get('complainant_gender'):
        detail_lines.append(f"Complainant Gender: {details['complainant_gender']}")
    if details.get('complainant_address'):
        detail_lines.append(f"Complainant Address: {details['complainant_address']}")
    if details.get('incident_date'):
        detail_lines.append(f"Incident Date: {details['incident_date']}")
    if details.get('incident_time'):
        detail_lines.append(f"Incident Time: {details['incident_time']}")

    known_details = "\n".join(detail_lines) if detail_lines else "None available from complaint narrative."

    prompt = f"""You are an experienced police FIR drafting officer in India working under the Bharatiya Nagarik Suraksha Sanhita, 2023.

TASK: Draft a complete First Information Report (FIR) based on the complaint narrative.

INSTRUCTIONS:
1. Extract ALL relevant details from the complaint.
2. Fill the FIR template completely and accurately.
3. Use formal legal language.
4. Be factual and precise.
5. Do NOT add reasoning, analysis, or explanations.
6. Output ONLY the completed FIR document.

KNOWN COMPLAINT DETAILS:
{known_details}

COMPLAINT NARRATIVE:
{query}

APPLICABLE BNS + BNSS SECTIONS:
{section_text}

{'-'*70}

FIRST INFORMATION REPORT (FIR)
Under Bharatiya Nagarik Suraksha Sanhita, 2023

Date of Registration: {today}
Time of Registration: {time_now}
Police Station: [To be filled by station]

{'-'*70}

1. COMPLAINANT DETAILS:
   Name:
   Age:
   Address:
   Contact:
   Occupation:

2. ACCUSED DETAILS:
   Name:
   Age (if known):
   Address (if known):
   Description:

3. INCIDENT DETAILS:
   Date of Incident:
   Time of Incident:
   Place of Occurrence:
   
4. NATURE OF OFFENCE:
   Category: {category}
   
5. APPLICABLE LEGAL SECTIONS:
   [List the applicable BNS and BNSS sections with brief description]

6. DETAILED FACTS OF THE CASE:
   [Provide clear, chronological narrative based on complaint]

7. PROPERTY/LOSS (if applicable):
   [List any property stolen, damaged, or loss incurred]

8. EVIDENCE/WITNESSES (if mentioned):
   [List any evidence or witnesses]

9. ACTION TAKEN:
    FIR registered and investigation initiated.

{'-'*70}

Signature of Complainant: _______________
Signature of Recording Officer: _______________

{'-'*70}

OUTPUT ONLY THE COMPLETED FIR. NO EXPLANATIONS.
"""
    try:
        response = client.chat.completions.create(
            model="microsoft/phi-4-mini-reasoning",
            messages=[
                {"role": "system", "content": "You are a police FIR drafting assistant. Output only the completed FIR document in plain text, with no analysis or commentary."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000,
            extra_body={"reasoning": {"effort": "low"}}
        )
        fir_text = clean_llm_output(response.choices[0].message.content)
        if is_valid_fir_output(fir_text):
            return fir_text
        print("[WARN] LLM FIR output not valid, using template fallback")
    except Exception as e:
        print(f"[WARN] FIR LLM failed: {e}")

    return generate_fir_template(query, sections_list)

# API Routes

@app.get("/")
async def root():
    return {"message": "Backend is running. Use /health for status or /docs for API docs."}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "BNS RAG System is running"}

@app.post("/api/sections", response_model=QueryResponse)
async def get_applicable_sections(request: QueryRequest):
    """
    Retrieve applicable BNS sections for a given query
    Uses RAG (Retrieval-Augmented Generation) for improved accuracy
    """
    if not request.query or len(request.query.strip()) < 10:
        raise HTTPException(status_code=400, detail="Query must be at least 10 characters long")
    
    try:
        # Retrieve relevant sections
        sections = retrieve_relevant_sections_enhanced(request.query, top_k=10)
        
        if not sections:
            raise HTTPException(status_code=404, detail="No applicable sections found")
        
        # Infer category
        categories = [s['category'] for s in sections]
        category = infer_category_from_sections(categories)
        
        # Convert to response format
        response_sections = [
            SectionSuggestion(
                section_id=s['section_id'],
                section_name=s['section_name'],
                law_type=s['law_type'],
                category=s['category'],
                severity=s['severity'],
                keywords=s['keywords'],
                description=s['description'],
                score=s['score']
            )
            for s in sections[:8]  # Return top 8 BNSS sections
        ]
        
        bns_count  = sum(1 for s in response_sections if s.law_type == "BNS")
        bnss_count = sum(1 for s in response_sections if s.law_type == "BNSS")

        return QueryResponse(
            sections=response_sections,
            category=category,
            message=f"Found {bns_count} BNS sections (substantive law) and {bnss_count} BNSS sections (procedural law)"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] /api/sections failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving sections: {str(e)}")

@app.post("/api/fir", response_model=FIRResponse)
async def generate_fir_document(request: FIRRequest):
    """
    Generate FIR document from query and selected sections
    Uses LLM with RAG context for accurate FIR generation
    """
    if not request.query or len(request.query.strip()) < 20:
        raise HTTPException(status_code=400, detail="Query must be at least 20 characters long")
    
    try:
        # Retrieve top candidates (we'll narrow down if the user specified IDs)
        all_sections = retrieve_relevant_sections_enhanced(request.query, top_k=10)
        
        if not all_sections:
            raise HTTPException(status_code=404, detail="No applicable sections found")
        
        # If the client sent a list of section_ids, filter the results accordingly
        if request.section_ids:
            selected = [sec for sec in all_sections if sec['section_id'] in request.section_ids]
            # preserve order of request.section_ids
            selected_sorted = []
            for sid in request.section_ids:
                for sec in selected:
                    if sec['section_id'] == sid:
                        selected_sorted.append(sec)
                        break
            all_sections = selected_sorted or selected
        
        if not all_sections:
            raise HTTPException(status_code=400, detail="No matching sections found for provided IDs")
        
        # Generate FIR using only the filtered sections
        fir_text = generate_fir(request.query, all_sections)
        
        section_ids = [s['section_id'] for s in all_sections]
        category = infer_category_from_sections([s['category'] for s in all_sections])
        
        return FIRResponse(
            fir=fir_text,
            sections=section_ids,
            category=category
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] /api/fir failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating FIR: {str(e)}")

def generate_sections_summary(sections: list[str]) -> str:
    """Ask the LLM to produce a concise summary of a list of BNS section texts.

    If the combined input is very short or looks like a template/placeholder,
    skip calling the LLM to avoid meta reasoning.
    """
    if not sections:
        return ""
    combined = "\n\n".join(sections).strip()
    if len(combined) < 80 or "section_id" in combined.lower():
        # too little real content or contains only template headers
        return ""

    prompt = (
        "You are a legal assistant. Read the following Bharatiya Nyaya Sanhita\n"
        "sections and produce a concise, factual summary that captures all\n"
        "important information (section ids, categories, severity, keywords,\n"
        "scenarios, descriptions, related sections, etc.).\n"
        "Respond ONLY with the summary text – do not preface your output with\n"
        "any commentary, analysis, or reasoning.\n\n" + combined
    )
    try:
        resp = client.chat.completions.create(
            model="microsoft/phi-4-mini-reasoning",
            messages=[
                {"role": "system", "content": "You are a concise legal summarization assistant. Output ONLY the summary text; do not include any reasoning, commentary or self-referential statements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.05,
            max_tokens=300,
            extra_body={"reasoning": {"effort": "low"}}
        )
        out = clean_llm_output(resp.choices[0].message.content)
        
        # truncate at any remaining reasoning markers
        truncate_patterns = [
            r"(\.|\n)\s*(?:Okay|Let me|First|Need|Maybe|Also|I think|I need|I should|The user)",
        ]
        for pattern in truncate_patterns:
            match = re.search(pattern, out, flags=re.IGNORECASE)
            if match and match.start() > 50:
                out = out[:match.start()].strip()
                break

        # validate: reject if reasoning leaked through
        if not out or len(out) < 40 or any(x in out.lower() for x in ['okay', 'let me', 'need to', 'i think', 'i should', 'first', 'maybe']):
            return ""
        return out
    except Exception:
        return ""  # fail silently



@app.on_event("startup")
async def startup():
    """Initialize system on startup"""
    initialize_system()

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    print("Shutting down BNS RAG System...")

if __name__ == "__main__":
    # For development, use: uvicorn main:app --reload
    # Or run with: "YOUR_CONDA_ENV/python.exe" -m uvicorn main:app --reload
    uvicorn.run(app, host="127.0.0.1", port=8000)
