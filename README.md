# Nyaya Sahayak — AI Legal Intelligence System

**Nyaya Sahayak** (न्याय सहायक - "Justice Helper") is an AI-powered legal intelligence web application designed for Indian law enforcement professionals. It analyzes crime complaints using AI, retrieves applicable legal sections from BNS (Bharatiya Nyaya Sanhita) and CrPC (Code of Criminal Procedure) databases, and auto-generates First Information Reports (FIRs) under BNSS 2023.

---

## 🚀 Quick Start

### Backend Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start the backend server:**
```bash
# Option 1: Using PowerShell script
.\start-backend.ps1

# Option 2: Direct Python
python main.py

# Option 3: Using Uvicorn
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will run at `http://127.0.0.1:8000`

**Note:** First startup may take 2-5 minutes to build vector databases from CSV files.

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

---

## 📊 System Overview

### Technology Stack

**Frontend:**
- React 18 with Vite 5
- React Router DOM v6
- Axios for API calls
- Professional fonts: Inter (UI), Crimson Pro (headings), IBM Plex Mono (technical)
- Clean, professional theme optimized for legal applications

**Backend:**
- FastAPI (Python web framework)
- ChromaDB (vector database)
- Sentence Transformers for embeddings
- RAG (Retrieval-Augmented Generation) architecture

### Legal Databases

- **BNS (Bharatiya Nyaya Sanhita, 2023)**: 358 sections defining crimes and punishments
- **CrPC (Code of Criminal Procedure)**: 531 sections outlining investigation procedures
- **Total**: 889 legal provisions with vector embeddings

---

## 🎯 Key Features

1. **AI Section Analysis** - Natural language complaint processing using vector embeddings
2. **Dual Input Modes** - Free-form text or structured form with dropdowns
3. **Real-Time Complaint Preview** - See generated complaint as you fill the form
4. **Real-Time Retrieval** - Instant query against 889 legal provisions
5. **Automated FIR Draft** - Generate complete FIR documents under BNSS 2023
6. **Severity Classification** - Sections tagged as High/Medium/Low severity
7. **Export & Share** - Copy, download, or print generated FIRs

---

## 📁 Project Structure

```
nyaya-sahayak/
├── main.py                          # FastAPI backend server
├── related_judgements.py            # Related judgements module
├── requirements.txt                 # Python dependencies
├── start-backend.ps1                # Backend startup script
├── start-without-llm.ps1            # Alternative startup script
├── bns_sections_enhanced.csv        # BNS legal sections data
├── crpc_sections_enhanced.csv       # CrPC legal sections data
├── bns_dbs_enhanced/                # BNS vector database (auto-generated)
├── crpc_dbs_enhanced/               # CrPC vector database (auto-generated)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                 # App entry point
        ├── App.jsx                  # Main app component
        ├── index.css                # Global styles & design system
        ├── App.css                  # Shared component styles
        ├── components/
        │   ├── Navigation.jsx       # Top navigation bar
        │   ├── QueryForm.jsx        # Complaint input form
        │   ├── SectionResults.jsx   # Legal sections display
        │   ├── FIRGenerator.jsx     # FIR document generator
        │   ├── Footer.jsx           # Page footer
        │   └── RelatedJudgements.jsx
        └── pages/
            ├── Home.jsx             # Landing page
            ├── Analyzer.jsx         # Main analysis page
            └── About.jsx            # About page
```

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Primary Blue: `#1e40af` - Authority, trust
- Secondary Green: `#059669` - Law, justice
- Accent Red: `#dc2626` - Urgency, high severity
- Warning Amber: `#f59e0b` - Medium severity
- Info Sky: `#0ea5e9` - Information

**Neutral Colors:**
- Background: `#ffffff`, `#f8fafc`, `#f1f5f9`
- Text: `#0f172a`, `#475569`, `#94a3b8`
- Borders: `#e2e8f0`

### Typography

- **Inter**: Modern sans-serif for UI, body text, navigation
- **Crimson Pro**: Elegant serif for headings, legal authority
- **IBM Plex Mono**: Technical monospace for labels, code, data

---

## 🔌 API Endpoints

### POST `/api/sections`
Retrieve applicable legal sections for a complaint.

**Request:**
```json
{
  "query": "A person was robbed at gunpoint on MG Road"
}
```

**Response:**
```json
{
  "sections": [
    {
      "section_id": "392",
      "section_name": "Robbery",
      "law_type": "BNS",
      "severity": "High",
      "category": "Offences Against Property",
      "description": "...",
      "keywords": "robbery, force, theft, violence"
    }
  ],
  "category": "Offences Against Property"
}
```

### POST `/api/fir`
Generate FIR document with selected sections.

**Request:**
```json
{
  "query": "A person was robbed at gunpoint on MG Road",
  "section_ids": ["392", "351", "154"]
}
```

**Response:**
```json
{
  "fir_text": "FIRST INFORMATION REPORT\n...",
  "sections_applied": [...],
  "generated_at": "2024-01-15T10:30:00"
}
```

---

## 📝 Usage Guide

### Text Complaint Mode

1. Navigate to the Analyzer page
2. Enter a detailed complaint in natural language
3. Click "Find Applicable Sections"
4. Review BNS and CrPC sections
5. Select relevant sections
6. Generate FIR document

### Structured Form Mode

1. Navigate to the Analyzer page
2. Switch to "Structured Form" mode
3. Fill in the form fields:
   - **Crime Types** (multi-select): Theft, Robbery, Assault, etc.
   - **Victim Details**: Name, gender, age group
   - **Accused Details** (optional): Name, relationship to victim
   - **Incident Details**: Location type, specific location, date, time
   - **Weapons Used** (multi-select): Knife, Gun, etc.
4. **See real-time complaint preview** as you fill the form
5. Add additional details if needed
6. Submit and review sections
7. Generate FIR document

### Complaint Preview Feature

When using the structured form, a preview box shows the generated complaint in real-time:

```
Crime(s): Robbery, Assault. Victim name: John Doe. Victim gender: Male. 
Victim age: Adult (18–60). Location type: Public Place. Location: MG Road, 
Bangalore. Date: 2024-01-15. Time: 14:30. Weapon used: Knife, Gun.
```

This helps verify the complaint before submission.

---

## 🛠️ Development

### Adding New Legal Sections

1. Update the CSV files (`bns_sections_enhanced.csv` or `crpc_sections_enhanced.csv`)
2. Delete the existing vector database folders (`bns_dbs_enhanced/` or `crpc_dbs_enhanced/`)
3. Restart the backend - it will automatically rebuild the databases

### Modifying the Frontend

The frontend uses a component-based architecture:

- `index.css` - Global design system and CSS variables
- `App.css` - Shared component styles (buttons, badges, cards)
- Component-specific CSS files for individual styling

### Running Tests

```bash
# Backend tests (if available)
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🔧 Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
pip install -r requirements.txt
```

**Port 8000 already in use:**
```bash
python main.py --port 8001
# or
uvicorn main:app --port 8001
```

**Vector databases missing:**
The backend will automatically create them on first run. Wait 2-5 minutes.

### Frontend Issues

**Dependencies not installed:**
```bash
cd frontend
npm install
```

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**Backend connection errors:**
Make sure the backend is running at `http://127.0.0.1:8000`

---

## 📦 Dependencies

### Backend (Python)
- fastapi
- uvicorn
- chromadb
- sentence-transformers
- pandas
- python-multipart

### Frontend (Node.js)
- react
- react-dom
- react-router-dom
- axios
- vite

---

## 🔒 Security Notes

- This is a development/demo application
- Do not use in production without proper security audits
- Implement authentication and authorization for production use
- Sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting and input validation

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Uses open-source libraries and frameworks
- Designed for Indian law enforcement professionals
- Implements BNS and CrPC legal frameworks

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure both backend and frontend are running
4. Check browser console for errors

---

## 🚦 System Requirements

**Backend:**
- Python 3.8 or higher
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space for vector databases

**Frontend:**
- Node.js 16 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

**Note**: Nyaya Sahayak is a legal intelligence tool. All legal sections and FIRs generated should be reviewed by qualified legal professionals before official use.

---

## 📈 Version History

**v1.0.0** - Initial Release
- BNS and CrPC section retrieval
- Dual input modes (text and structured form)
- Real-time complaint preview
- FIR generation
- Professional UI theme
- 889 legal provisions with AI-powered search
