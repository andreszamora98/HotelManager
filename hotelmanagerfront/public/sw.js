// public/sw.js

// URL que queremos interceptar:
const LOCAL_API_ORIGIN = 'http://localhost:3001'

// Escuchamos todas las peticiones que haga la página:
self.addEventListener('fetch', event => {
  try {
    const reqUrl = new URL(event.request.url)

    // Si la petición va a http://localhost:3001/…
    if (reqUrl.origin === LOCAL_API_ORIGIN) {
      // Reconstruimos la URL para que apunte a /api/…
      const newUrl = new URL(event.request.url)
      newUrl.host = self.location.host             // mismo host que la app
      newUrl.port = ''                              // usa el mismo puerto (4173)
      newUrl.protocol = self.location.protocol      // http o https
      newUrl.pathname = '/api' + newUrl.pathname    // prefijo /api

      // Clonamos la petición original pero con la URL nueva
      const newReq = new Request(newUrl.href, event.request)
      // Disparamos el fetch real
      event.respondWith(fetch(newReq))
    }
  } catch (err) {
    // si algo explota, dejamos pasar la petición normal
  }
})
