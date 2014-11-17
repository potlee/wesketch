cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.labs.keyboard/www/keyboard.js",
        "id": "org.apache.cordova.labs.keyboard.keyboard",
        "clobbers": [
            "window.Keyboard"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.labs.keyboard": "0.1.2"
}
// BOTTOM OF METADATA
});