import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema ({
    videoFile : {
        type : String ,//cloudnary
        require : true
    },
    thumbnail : {
        type : String ,
        require : true
    },
    title : {
        type : String ,
        require : true
    },
    discription : {
        type : String ,
        require : true
    },
    duration : {
        type : Number ,
        require : true
    },
    views : {
        type : Number ,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }

},{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)
export const videoModel = mongoose.model("Video",videoSchema)