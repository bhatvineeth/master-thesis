const GuacamoleLite = require('guacamole-lite');

const websocketOptions = {
    port: 8080 
};

const guacdOptions = {
		host: '0.0.0.0',
    port: 4822
};

const clientOptions = {
    crypt: {
        cypher: 'AES-256-CBC',
        key: 'MySuperSecretKeyForParamsToken12'
    },
    allowedUnencryptedConnectionSettings: {
        vnc: [
            'width',
            'height',
            'dpi'
        ]
    }
};

const guacServer = new GuacamoleLite(websocketOptions, guacdOptions, clientOptions);
return guacServer;