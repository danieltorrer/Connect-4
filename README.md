Connect 4
==========

![Imgur](http://i.imgur.com/YstzI0h.gifv)

Conecta 4 recrea el clásico juego de mesa de los 80's con un modo multijugador. Esta implementado en Node.js y funciona en tiempo real utilizando Socket.io. Para la parte de la lógica se utilizó DLV que es un lenguaje para lógicas disyuntivas. Este es un pequeño experimento el cual seguramente necesita varios ajustes.

### Versión
0.7
[Live] 

### Tecnologías

Proyectos open source que le dieron vida a este pequeño experimento

* [Foundation] - Framework UI para aplicaciones web modernas.
* [Jade] - Lenguaje de template para Node.js.
* [Express] - Framework de Node.js rápido y sencillo.
* [node.js] - backend basado en eventos I/O.
* [DLV] - Sistema de inteligencia artificial basado en lógica disyuntiva.
* [jQuery] - duh.

### Instalación

Solo clona el repositorio. (Funciona solo en sistemas GNU/Linux) 

```sh
$ git clone 
```
E instala las dependencias
```sh
$ npm install
```

### Funcionamiento

Este juego requiere que dos jugadores se conecten para poder iniciar el juego. Cada usuario tiene un tiro por turno.

### To do
- Salas  manejar múltiples usuarios.
- Mejorar IU.
- Programar situación de empate
- Mejorar rendimiento en dispositivos móviles

[Foundation]:http://foundation.zurb.com/
[node.js]:http://nodejs.org
[jQuery]:http://jquery.com
[express]:http://expressjs.com
[DLV]:http://www.dlvsystem.com/
[Jade]:http://jade-lang.com/
[Live]: http://pacific-eyrie-9152.herokuapp.com
0
