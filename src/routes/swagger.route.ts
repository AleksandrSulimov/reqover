import {Router} from 'express';
import SwaggerController from '../controllers/swagger.controller';

class SwaggerRoute {
    public router = Router();
    public swaggerController = new SwaggerController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/info', this.swaggerController.info);
        this.router.get('/reqover/swagger/report', this.swaggerController.swaggerReport);
        this.router.get('/coverage', this.swaggerController.coverage);
        this.router.get('/reqover/specs', this.swaggerController.specs);
        this.router.get('/reset', this.swaggerController.reset);
        this.router.post('/reqover/config', this.swaggerController.saveConfig);
        this.router.get('/swagger', this.swaggerController.config);
        this.router.use('/reqover/swagger', this.swaggerController.swaggerApi);
    }
}

export default SwaggerRoute;
