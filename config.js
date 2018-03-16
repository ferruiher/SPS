var config = {
    server:{
        portApi : 3082,
        portUI : 3083,
    },
    paths:{
        FILEPATH : '/home/fer/Descargas/tem/',
        SAVEPATH : '/home/fer/Imágenes/'

    },
    pixabay:{
        apiKey: '8047832-4eb74703bfe5535846a8f3959',
        numPag: 5,
        numImagePage: 100
    },
    web:{
        urlDownload: 'http://localhost:3083/post/search',
        urlSearch: 'http://localhost:3083/post/download',
        urlIni:'http://localhost:3082'
    }
}

module.exports = config;