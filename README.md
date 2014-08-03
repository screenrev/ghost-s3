# Ghost S3

This is an S3 file module for Ghost blogs.



## Install

	npm install --save ghost-s3


## Configure

In your ghost config.js file under "development" and "production" add

	aws: {
	    accessKeyId: 'your aws access key id>',
	    secretAccessKey: 'your AWS secret access key>',
	    bucket: 'your-bucket-name',
	    region: 'the AWS region your bucket is in',
	    cdnPath: 'path to CDN (e.g. Cloudflare & S3 integration - leave blank if using Amazon CloudFront)',
	    prefixPath: 'prefix folder (e.g. images)'
	},


## Plug In

Until Ghost has a file module system, you will have to change the file ```storage/index```

```javascript
	storage = require('./' + storageChoice);
```

becomes

```javascript
	storage = require('ghost-s3')({
	    errors: errors,
	    config: require('../config')().aws
	});
```


