# Hosting instructions
- Server is hosted temporarily on aws lambda
- UI is hosted on S3
- Zip all contents of the server project into server.zip file
- Run command ```AWS_ACCESS_KEY_ID=ABCD AWS_SECRET_ACCESS_KEY=EF1234 aws lambda update-function-code --function-name client --zip-file fileb://./server.zip``` to upload this to the lambda function. Replace the proper secret and access keys
- To upload the UI, run command ```npm run build``` after replacing apiUrl to ''
- Upload the UI to S3 using command ```AWS_ACCESS_KEY_ID=ABCD AWS_SECRET_ACCESS_KEY=EF1234 aws s3 sync s3://test.guestconvo .```