import sys
sys.path.insert(0, r'C:\Users\harsh\Downloads\SDP (2)\SDP')
import main
from fastapi.testclient import TestClient

try:
    main.initialize_system()
    print('init done')
    sections = main.retrieve_relevant_sections_enhanced('A person was robbed at night in a park and assaulted', top_k=10)
    print('sections count', len(sections))
    print(sections[:2])

    client = TestClient(main.app)
    response = client.post('/api/sections', json={'query': 'A person was robbed at night in a park and assaulted'})
    print('status_code', response.status_code)
    print('response', response.text)
except Exception:
    import traceback
    traceback.print_exc()
    raise
