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
    name = input("Nombre de la foto? ")
    category = input("Categoria de la foto? ")
    dia = input("Dia de la foto? 0-6 0 siendo domingo. -1 para que sea permanente.")
  listaDeDias = list(dia)
  i = 0
  for dia in listaDeDias:
    listaDeDias[i] = int(dia)
    i += 1
  
  print(listaDeDias)
  photo["dia"] = listaDeDias
  photo["name"] = name
  photo["category"] = category

f.close()

d = open("photos.json", "w")
d.write(json.dumps(photoList))
d.close()
