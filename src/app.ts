import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import compression from 'compression';
import {logger} from './utils/logger';
import {createProxyMiddleware} from 'http-proxy-middleware';
import {API_SERVICE_URL} from './config/constants';

export const spec = [];

class App {
    public app: express.Application;
    public port: string | number;
    public env: string;

    constructor(routes: any[]) {
        this.app = express();
        this.app.set('view engine', 'ejs');
        this.port = process.env.PORT;
        this.env = process.env.NODE_ENV;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);

        this.app.use(
            '/',
            createProxyMiddleware({
                target: API_SERVICE_URL,
                changeOrigin: true,
                pathRewrite: {
                    [`^/`]: '',
                },
                onProxyReq: proxyReq,
                onProxyRes: proxyRes,
            }),
        );
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`🚀 App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        if (this.env === 'production') {
            this.app.use(morgan('combined'));
        } else if (this.env === 'development') {
            this.app.use(morgan('dev'));
        }
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(express.static('vendor'));
    }

    private initializeRoutes(routes: any[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }
}

const proxyReq = (proxyReq, req, next) => {
    // add custom header to request
    // or log the req
};

const proxyRes = (proxyRes, req, res) => {
    const method = req.method;
    const responseStatus = `${proxyRes.statusCode}`;
    const path = req.originalUrl.split('?')[0];
    const params = req.query;
    const queryParameters = Object.entries(params).map(([p, v]) => {
        return {name: p, value: v};
    });

    spec.push({
        path: path,
        method: method,
        response: responseStatus,
        parameters: queryParameters,
    });
};
export default App;
