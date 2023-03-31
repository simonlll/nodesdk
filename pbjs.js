var pbjs = require("protobufjs-cli/pbjs"); // or require("protobufjs-cli").pbjs / .pbts
var fs = require('fs');

pbjs.main([ "--target", "static-module", "./Message.proto" ], function(err, output) {
    if (err)
        throw err;
    // do something with output
    console.log(output);
    fs.writeFile("./message.js",output,function (err) {
        if(err){
            console.log(err);
        }
    })
});