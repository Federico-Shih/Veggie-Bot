const employeeCommands = {
  help: {
    message: 'Uso: veg -h. Devuelve posibles comandos',
  },
  setgroup: { message: 'SHitt'},
  commandMapper: () => {},
};

for (let command of Object.entries(employeeCommands)) {
  console.log(command[1].hasOwnProperty('message'))
} 
