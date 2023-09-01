import Job from '../models/Job.js'
import StatusCodes from 'http-status-codes'
import Errors from '../errors/index.js'

import mongoose from 'mongoose';
import moment from 'moment/moment.js';

const getAllJobs = async (req, res) => {
    const { search, status, jobType, sort } = req.query;
  
    // protected route
    const queryObject = {
        createdBy: req.user.userId,
    };
  
    if (search) {
        queryObject.position = { $regex: search, $options: 'i' };
    }

    // add stuff based on condition
    if (status && status !== 'all') {
        queryObject.status = status;
    }

    if (jobType && jobType !== 'all') {
        queryObject.jobType = jobType;
    }
  
    // NO AWAIT
    let result = Job.find(queryObject);
  
    // chain sort conditions
    if (sort === 'latest') {
        result = result.sort('-createdAt'); //minus for descending
    }

    if (sort === 'oldest') {
        result = result.sort('createdAt');
    }

    if (sort === 'a-z') {
        result = result.sort('position');
    }

    if (sort === 'z-a') {
        result = result.sort('-position'); //minus for descending
    }

  
    // setup pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    result = result.skip(skip).limit(limit);
  
    const jobs = await result;
  
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);
  
    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};


const getJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req

    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId,
    })

    if (!job) {
        throw new Errors.NotFoundError(`No job with id ${jobId}`)
    }

    res.status(StatusCodes.OK).json({ job })
}


const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId },
    } = req

    if (company === '' || position === '') {
        throw new Errors.BadRequestError('Company or Position fields cannot be empty')
    }

    const job = await Job.findByIdAndUpdate(
        { _id: jobId, createdBy: userId },
        req.body,
        { new: true, runValidators: true }
    )

    if (!job) {
        throw new Errors.NotFoundError(`No job with id ${jobId}`)
    }

    res.status(StatusCodes.OK).json({ job })
}


const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req

    const job = await Job.findByIdAndRemove({
        _id: jobId,
        createdBy: userId,
    })

    if (!job) {
        throw new Errors.NotFoundError(`No job with id ${jobId}`)
    }

    res.status(StatusCodes.OK).send()
}


const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        // for my version I have to use the 'new' keyword
        // we use mongoose.Types as userId is a string but we want that to be a mongoose object
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } }, 
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  
    // the purpose of doing this is due to frontend where it wants an object format where the 
    // status to be the keys and the count to be the values
    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});
  
    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
    };
  
    let monthlyApplications = await Job.aggregate([
        // for my version I have to use the 'new' keyword
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        { $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
    ]);

    monthlyApplications = monthlyApplications
        .map((item) => {
            const {_id: { year, month }, count} = item;
            const date = moment() //using moment.js package here
                .month(month - 1) //-1 is because moment treats month differently from mongoose
                .year(year)
                .format('MMM Y');
            return { date, count };
        }).reverse(); //because in the frontend, the last mth is displayed as last item in the chart
  
    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export default {
    createJob,
    deleteJob,
    getAllJobs,
    updateJob,
    getJob,
    showStats
}
