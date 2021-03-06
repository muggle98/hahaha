#  this file reads the chats in ../chats/ and write suggest.js into 
#  ../public/Scripts/. It uses suggest_base.js.


import json
from pprint import pprint
import glob

chat_path = 'chats/'

chatHist = []

for filename in glob.glob(chat_path + '*.json'):
    f = open(filename)
    chatHist.append(json.load(f))
    f.close()

f = open('public/Scripts/hist.autojs', 'w') # use .autojs extension so that supervisor doesn't force us to restart
f.write('chatHist = ')
json.dump(chatHist, f)
f.write('\n\n')


f.close()
    
