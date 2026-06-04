import sys
sys.path.insert(0, r'C:\Users\harsh\Downloads\SDP (2)\SDP')
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'
import main

main.initialize_system()
print('BNS count:', main.bns_db._collection.count())
print('BNSS count:', main.bnss_db._collection.count())
print('BNS collection name:', main.bns_db._collection.name)
print('BNSS collection name:', main.bnss_db._collection.name)

q = 'A person was robbed at night in a park and assaulted by two men'
print('Query:', q)
res = main.bns_db.similarity_search_with_score(q, k=5)
print('BNS raw results len', len(res))
for doc, score in res:
    print('  ', score, doc.metadata.get('section_id'), doc.metadata.get('law_type'))
res2 = main.bnss_db.similarity_search_with_score(q, k=5)
print('BNSS raw results len', len(res2))
for doc, score in res2:
    print('  ', score, doc.metadata.get('section_id'), doc.metadata.get('law_type'))
