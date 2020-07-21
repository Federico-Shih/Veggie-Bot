import json

f = open("photos.json", "r")

photoList = json.loads(f.read())

for photo in photoList:
  print(photo["oldName"])
  name = input("Nombre de la foto? ")
  category = input("Categoria de la foto? ")
  dia = input("Dia de la foto? 0-6 0 siendo domingo. -1 para que sea permanente.")
  while (name.strip() == "" or category.strip() == "" or dia.strip() == ""):
    print("Error ingresando datos")
    dia = input("Dia de la foto? 0-6 0 siendo domingo. -1 para que sea permanente.")
  photo["dia"] = int(dia)
  photo["name"] = name
  photo["category"] = category

f.close()

f = open("photos.json", "w")
f.write(json.dumps(photoList)
f.close()
