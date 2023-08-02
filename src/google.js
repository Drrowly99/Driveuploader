const express = require('express');
const app = express();
const fs = require('fs');
const request = require("request");
const {google} = require('googleapis');
const path = require('path');
const process = require('process');
const dotenv = require('dotenv');
const mime = require('mime');
const uploadMiddleware = require('../src/middlewares/uploadMiddleware');
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
  );

  const oauth3Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
  );
  
  // set auth as a global default


  try{
    const cred = fs.readFileSync("cred.json");
    oauth2Client.setCredentials(JSON.parse(cred)); // should be set as json
  } catch(err) {
    console.log("no creds found")
  }

  module.exports = app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive"],
    });
    res.redirect(url);
});

module.exports = app.get('/user', async (req, res) => {
    oauth3Client.setCredentials({access_token: process.env.ACCESS_TOKEN}); 
    const oath_user = google.oauth2({
        version: 'v2',
        auth: oauth3Client
      });
        let { data } = await oath_user.userinfo.get();    // get user info
      console.log(data.id);
      console.log(data.email);
      console.log('second wave');

      oauth3Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          // store the refresh_token in my database!
          console.log(tokens.access_token);
        }
      });

});

module.exports = app.get('/refresh', async (req, res) => {
    var tok;
    var read = fs.readFileSync('cred.json');
    var json = JSON.parse(read);
    console.log(json);

    oauth2Client.setCredentials(json); 

      oauth2Client.refreshAccessToken((err, tokens) => {
        // your access_token is now refreshed and stored in oauth2Client
        // store these new tokens in a safe place (e.g. database)
        console.log(tokens.access_token)
        tok = tokens.access_token
        res.send(`success:${tok}`)
        fs.writeFileSync("cred.json", JSON.stringify(tokens));
      });

    //   refreshAccessToken()
    
});

module.exports = app.get('/redirect', async (req, res) => {
    console.log('redirect')
    const {code} = req.query;
    const {tokens} = await oauth2Client.getToken(code);
    
    oauth2Client.setCredentials(tokens);

    fs.writeFileSync("cred.json", JSON.stringify(tokens));

    // let { data } = await oath_user.userinfo.get();    // get user info
    console.log('first wave');
    console.log(tokens.access_token)


    oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });
    //   refreshAccessToken('null', tokens)
    //   oauth2Client.refreshAccessToken((err, tokens) => {
    //     // your access_token is now refreshed and stored in oauth2Client
    //     // store these new tokens in a safe place (e.g. database)
    //     console.log(tokens.access_token)
    //   });

      res.redirect('http://localhost:3000/up')

      res.send(`Success ${tokens.access_token} and refresh = ${tokens.refresh_token} and scope = ${tokens.scope}`);

});

module.exports = app.get('/redirects', async (req, res) => {
    console.log('redirect')
    
    let str = "drrowly99@gmail.com"
    email = str.substring(0, str.length - 10);

    const {code} = req.query;
    const {tokens} = await oauth2Client.getToken(code);
    let tok = {'email':tokens}
    console.log(tok)


    // var read = fs.readFileSync('cred.json');
    // var json = JSON.parse(read);
    // json.push(tok)

    // fs.writeFileSync("cred.json", JSON.stringify(json));
    // oauth2Client.setCredentials(tok.drrowly99);
    // res.send(`Success ${tokens.access_token} and refresh = ${tokens.refresh_token} and scope = ${tokens.scope}`);
    // res.redirect('http://localhost:3000/up')
});


module.exports = app.post('/upload/', uploadMiddleware, async (req, res) => {

    // 1. Retrieve session for resumable upload.
request(
    {
      method: "POST",
      url:
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: "sample.png", mimeType: "image/png" })
    },
    (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
  
      // 2. Upload the file.
      request(
        {
          method: "PUT",
          url: res.headers.location,
          headers: { "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}` },
          body: fs.readFileSync(filename)
        },
        (err, res, body) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(body);
        }
      );
    }
  );

})

module.exports = app.post('/uploads/', uploadMiddleware, async (req, res) => {
      // Handle the uploaded files
        const files = req.files;
        var numCallbackRuns = 0;
        var holdFileId = '';
        console.log(files.length)
     

        // Process and store the files as required
        // For example, save the files to a specific directory using fs module
        files.forEach((file) => {
        
            
            const filePath = `uploads/${file.filename}`;
            console.log(mime.getType(filePath));

            let folder = req.body.text
            const type = file.mimetype
            const filename_ = file.filename
            if(folder == ''){
                folder = 'none'
            }
            if(folder == 'none'){
                uploadFile(folder, type, filename_)
                console.log('agh')
                
            }else{
                if(numCallbackRuns >= 1){
                    uploadFile(holdFileId, type, filename_) 
                }
                createFolder(folder, type, filename_)
                console.log('good')
                
            }
            fs.rename(file.path, filePath, (err) => {
            if (err) {
                // Handle error appropriately and send an error response
                // return res.status(500).json({ error: 'Failed to store the file' });
            }
            });
            numCallbackRuns++;
        });

        // Send an appropriate response to the client
        // res.status(200).json({ message: 'File upload successful' });
        //END


    // const folder = req.params.folder







async function generatePublicUrl(fileIds) {
    const per = google.drive({
        version: 'v3',
        auth: oauth2Client
      });
      const fileId = fileIds
    try{
     
        const permit = await per.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
                // type: 'user',
                // emailAddress: 'youremail@gmail.com'
            }
        })

        const result = await per.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink'
        })

        console.log(result.data)

        res.status(200).json({ message: result.data });

    } catch (err) {
        console.log(err.message)
    }
}



async function uploadFile(data, type, filename_){
    const drive = google.drive({
                version: 'v3',
                auth: oauth2Client
              });
              
    const sometext = 'mono is good'
    const folderId = data;
    console.log('CONFIRM FIRST FOLDER Id:',folderId);
    if(folderId !== 'none'){
        try{
            const response = await drive.files.create({
            
                    requestBody: {
                    name: filename_,
                    parents: [folderId],
                    mimeType: type
                    },
                    media: {
                    mimeType: type,
                    body: fs.createReadStream('uploads/'+filename_),
                    }
                
            });

            console.log(response.data.id)
            generatePublicUrl(response.data.id)
        } catch (err){
            console.log(err.message)
        }
    }else{
        try{
            const response = await drive.files.create({
            
                    requestBody: {
                    name: filename_,
                    mimeType: type
                    },
                    media: {
                    mimeType: type,
                    body: fs.createReadStream('uploads/'+filename_),
                    }
                
            });

            console.log(response.data.id)
            generatePublicUrl(response.data.id)
        } catch (err){
            console.log(err.message)
        }   
    }
}


async function createFolder(data, type, filename_) {
    // Get credentials and build service
    // TODO (developer) - Use appropriate auth mechanism for your app
  
    // const {GoogleAuth} = require('google-auth-library');
    // const {google} = require('googleapis');
  
    // const auth = new GoogleAuth({
    //   scopes: 'https://www.googleapis.com/auth/drive',
    // });
    const service = google.drive({version: 'v3',  auth: oauth2Client});
    const fileMetadata = {
      name: data,
      mimeType: 'application/vnd.google-apps.folder',
    };
    try {
      const file = await service.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      console.log('first FOLDER Id:', file.data.id);
      global.holdFileId = file.data.id;
      uploadFile(file.data.id, type, filename_)
    //   return file.data.id;
    } catch (err) {
      // TODO(developer) - Handle error
      throw err;
    }


  }


})

// module.exports = app.get('/upload/:sometext', async (req, res) => {
//     const drive = google.drive({
//         version: 'v3',
//         auth: oauth2Client
//       });
      
//       const sometext = req.params.sometext

//      await drive.files.create({
//         requestBody: {
//           name: 'Test',
//           mimeType: 'text/plain'
//         },
//         media: {
//           mimeType: 'text/plain',
//           body: 'Hello World'
//         }
//       });
//       return success;
// })