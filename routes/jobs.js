import { Router } from 'express'
import controllerJobs from '../controllers/jobs.js'
import testUser from '../middleware/testUser.js'

const router = Router()

router.route('/')
    .post(testUser, controllerJobs.createJob)
    .get(controllerJobs.getAllJobs)

router.route('/stats').get(controllerJobs.showStats);    

router.route('/:id')
    .get(controllerJobs.getJob)
    .delete(testUser, controllerJobs.deleteJob)
    .patch(testUser, controllerJobs.updateJob)

export default router
