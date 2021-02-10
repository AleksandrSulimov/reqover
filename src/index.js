import express from 'express';
import morgan from "morgan";
import { createProxyMiddleware } from 'http-proxy-middleware';
import {
  anOpenApiSpec,
  OpenApiSpecBuilder,
} from '@loopback/openapi-spec-builder';
import swaggerParser from 'swagger-parser';
import UrlPattern from 'url-pattern'
// Create Express Server
const app = express();
// const spec = anOpenApiSpec()

const spec ={
  paths: {
    "/v2/pet/9222968140497114544": {
      get: {
        responses: {
          "404": {
          },
        },
      },
    },
    "/v2/pet/findByStatus": {
      get: {
        responses: {
          "200": {
          },
        },
      },
    },
    "/v2/pet/200": {
      get: {
        responses: {
          "200": {
          },
        },
      },
    },
  },
}



// Configuration
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_URL = "https://petstore.swagger.io";

// Logging
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
  const a = Object.entries(data).forEach( ([key, value]) => {
       const specificationData = {
          parameters: [],//(ParameterObject | ReferenceObject),
          requestBody: null,//RequestBodyObject | ReferenceObject,
          responses: value.responses,
        }

        spec.withOperation(value.methodName, key, specificationData)
  })

  res.send(spec.build());
});



function regExMatchOfPath(apiPath, rPath) {
  const options = {
    optionalSegmentStartChar: "{",
    optionalSegmentEndChar: "}",
  };
  const pattern = new UrlPattern(apiPath.replace(/\/{/g, "{/:"), options);
  return pattern.match(rPath);
}

function getCovered(swaggerPath, coveredPaths){
  const result = {}
  coveredPaths.forEach(path => {
      Object.entries(path[1]).forEach(([methodName, data]) => {
        const coveredResponses = Object.keys(data.responses)
        if (swaggerPath in result){
          result[swaggerPath][methodName].responses.push(...coveredResponses)
        } else {
           result[swaggerPath] = {
             [methodName]: {
               responses: [...coveredResponses]
             }
           }
        }
      })
  })
  return result
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

app.get('/cov',async (req, res) => {
  const swaggerInfo = await swaggerParser.validate("https://petstore.swagger.io/v2/swagger.json");
  
  const basePath = swaggerInfo.basePath
  const coveredPaths = spec.paths
  const apiPaths = Object.entries(swaggerInfo.paths)
  const testsCoveredApis = Object.entries(coveredPaths)

  const apiCovList = apiPaths.map(([apiPath, value]) => {
    const swaggerPath = `${basePath}${apiPath}`

    const coveredPaths = testsCoveredApis.filter(path => {
      return regExMatchOfPath(swaggerPath, path[0])
    })

    const coverageResult = getCovered(swaggerPath, coveredPaths)

    if(isEmpty(coverageResult)){

      const expected = {}
      Object.entries(value).forEach(([methodName, data]) => {
          const expectedResponses = Object.keys(data.responses)
          const responseCoverageResult = expectedResponses.map(r => {
            return {[r]: false}
          })

          expected[methodName] = {
            responses: responseCoverageResult
          }
      })

      return {[apiPath]:expected}
    }

    const expected = {}
    Object.entries(value).forEach(([methodName, data]) => {
        const coveredResponses = coverageResult[swaggerPath][methodName]?.responses
        const expectedResponses = Object.keys(data.responses)

        const responseCoverageResult = expectedResponses.map(r => {
          let status = false
          if (coveredResponses?.includes(r)){
            status = true
          }

          return {[r]: status}
        })

        expected[methodName] = {
          responses: responseCoverageResult
        }
    })

    return {
      [apiPath]:expected
    }
  })

  res.send(apiCovList)
})

function proxyReq(proxyReq, req, res) {
  // add custom header to request  
  // or log the req
}

function proxyRes(proxyRes, req, res) {
  const method = req.method.toLowerCase()
  const responseStatus = `${proxyRes.statusCode}`
  const path = req.originalUrl
  const params = req.query

  if(d){
    d[[method]][responses][[responseStatus]] = {}
  }else {
    spec.paths[path] = {
        [method]: {responses: {
          [responseStatus]: {}
        }
      }
    }
  }
}

// Proxy endpoints
app.use('/', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
      [`^/`]: '',
  },
  onProxyReq: proxyReq,
  onProxyRes: proxyRes,
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});