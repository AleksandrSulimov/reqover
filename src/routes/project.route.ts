import {Router} from 'express';
import ProjectsController from '../controllers/projects.controller';

class ProjectRoute {
    public router = Router();
    public projectsController = new ProjectsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/projects', this.projectsController.listProjects);
        this.router.post('/projects', this.projectsController.createProject);
        this.router.get('/', this.projectsController.index);
        this.router.get('/projects/:id', this.projectsController.get_project_by_id);
    }
}

export default ProjectRoute;
