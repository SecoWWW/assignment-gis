import csv
from datetime import datetime
import json

with open('ChicagoData.csv') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',')    
    mydict = {}
    i = 0
    for row in spamreader:        
        date = row[3].split()[0]
        i += 1
        try:
            date = datetime.strptime(date, '%d/%m/%Y')            
        except:
            print('Wrong Format')
            continue                        
        date = date.replace(day=1).strftime('%d/%m/%Y')
        beat = row[11]
        
        key = (date, beat)
        if key in mydict:
            mydict[key] += 1
        else:
            mydict[key] = 1                
        if i >= 10000:
            print('Reached 10000')
            i = 0
    print(mydict)
    # for key, value in mydict.items():
    #     date, beat = key
    #     print (date, end=', ')
    #     print (beat, end=', ')        
    #     print(value)
    with open('filtered_data.csv', 'w', newline='') as output:
        spamwriter = csv.writer(output, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
        spamwriter.writerow(['beat', 'date', 'crimes'])
        for key, value in mydict.items():
            date, beat = key
            spamwriter.writerow([beat, date, value])
            


    # with open('result.json', 'w') as file:
    #     json.dump(mydict, file)