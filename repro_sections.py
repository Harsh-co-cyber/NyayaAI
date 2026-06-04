import sys
sys.path.insert(0, r'C:\Users\harsh\Downloads\SDP (2)\SDP')
import main
from fastapi.testclient import TestClient

main.initialize_system()
client = TestClient(main.app)

queries = [
    'A person was robbed at night in a park and assaulted by two men',
    'Someone stole a mobile phone from a motorcycle',
    'There was a burglary and theft at the house',
    'A woman was harassed and physically assaulted during commute',
    'The victim was injured in a road accident and property was damaged',
]

for q in queries:
    print('QUERY:', q)
    try:
        sections = main.retrieve_relevant_sections_enhanced(q, top_k=10)
        print('retrieved', len(sections))
        if sections:
            for s in sections[:3]:
                print(s['law_type'], s['section_id'], s['score'], s['category'])
        else:
            print('no sections returned')
    except Exception:
        import traceback; traceback.print_exc()
    print('---')

print('API test')
resp = client.post('/api/sections', json={'query': queries[0]})
print(resp.status_code, resp.text)
