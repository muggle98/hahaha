#  this file reads the chats in ../chats/ and write suggest.js into 
#  ../public/Scripts/. It uses suggest_base.js.


import json
from pprint import pprint
import glob

chat_path = '../chats/'

chats = []

for filename in glob.glob(chat_path + '*.json'):
    f = open(filename)
    chats.append(json.load(f))
    f.close()

f = open('../public/Scripts/CHATS.js', 'w')
f.write('CHATS = ');
json.dump(chats, f)
f.write('\n\n')

f.close()
    
