import os
from flask import Flask, render_template, request, session, redirect
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
import shortuuid

app = Flask(__name__)

app.secret_key = os.urandom(24) 

password = "842757"

PHOTO_FOLDER = os.path.join('static', 'images')

def get_images():
  client = MongoClient(os.environ["DATABASE_URL"])
  db = client["veggie-club"]
  foods = db.foods
  photos = foods.find({})
  photoList = []
  for photo in photos:
    photo["path"] = os.environ["DOMAIN"] + "/" + photo.get("path")
    photoList.append(photo)
  return photoList

@app.route('/', methods=["GET", "POST"])
def login():
  if request.method == "GET":
    return render_template("login.html")
  if request.method == "POST":
    if request.form.get("password").strip() == "":
      return render_template("login.html", message="No ingresaste contraseña")
    if request.form.get("password").strip() == password:
      session["password-set"] = True
      return redirect("/photos")
    else:
      return render_template("login.html", message="Contraseña incorrecta")

@app.route('/remove_photo', methods=["POST"])
def remove_photo():
  client = MongoClient(os.environ["DATABASE_URL"])
  db = client["veggie-club"]
  foods = db.foods
  food = foods.find_one({ '_id': ObjectId(request.form.get("photo_id"))})
  try:
    os.remove(os.path.join(PHOTO_FOLDER, food['path']))
  except:
    print("No such image")
  foods.delete_one({ '_id': ObjectId(request.form.get("photo_id"))})
  return redirect('/photos')

@app.route('/photos', methods=["GET", "POST"])
def photos():
  client = MongoClient(os.environ["DATABASE_URL"])
  db = client["veggie-club"]
  foods = db.foods
  if session.get("password-set") is not None: 
    if request.method == "GET":
      return render_template("photos.html", photos=get_images())
    if request.method == "POST":
      errMsg = ""
      photo = request.files.get("photo")
      category = request.form.get("category")
      name = request.form.get("name")
      days = request.form.get("days")
      if photo.filename.strip() == "":
        errMsg += "No hay foto seleccionada. \n"
      if (category.strip() == ""):
        errMsg += "No hay categoria ingresada. \n"
      if (name.strip() == ""):
        errMsg += "No hay nombre ingresada. \n"
      if (days.strip() == ""):
        errMsg += "No hay cantidad de dias ingresadas. \n"
      if errMsg == "":
        days = list(days)
        for i in range(0, len(days)):
          days[i] = int(days[i])
        ext = photo.filename.split(".")
        ext = ext[len(ext) - 1]
        filename =  f'{shortuuid.uuid()}.{ext}'
        
        photo.save(os.path.join(PHOTO_FOLDER, filename))

        newPhoto = {
          'path': filename,
          'name': name,
          'category': category,
          'day': days,
        }
        foods.insert_one(newPhoto)
        return redirect('/photos')
      return render_template("photos.html", errMsg=errMsg)
  else:
    return redirect("/")