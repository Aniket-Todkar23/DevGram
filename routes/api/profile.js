const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth')
const User=require('../../models/User')
const Profile = require('../../models/Profile');
const {check,validationResult}=require('express-validator')
//@route       GET api/profile/me
//@description get current users profile
//@access      private
router.get('/me',auth,async(req,res)=>{
    try{
    const profile= await Profile.findOne({user:req.user.id}).populate('user',
        ['name','email','avatar']
    );
    if (!profile){
        return res.status(400).json({msg:'Profile not found'})
    }
    res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(400).send('Server Error');
    }
});
//@route        POST api/profile/me
//@description  create or update user profile
//@access      private
router.post('/',[auth,[check('status','Status is required').notEmpty(),
    check('skills','Skills is required').notEmpty()
]],
async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {
  company,
  website,
  location,
  bio,
  status,
  githubusername,
  skills,
  youtube,
  facebook,
  twitter,
  instagram,
  linkedin
} = req.body;
//Build Profile Object
const profileFields={};
profileFields.user=req.user.id;
if(company)profileFields.company=company;
if(website)profileFields.website=website;
if(location)profileFields.location=location;
if(bio)profileFields.bio=bio;
if(status)profileFields.status=status;
if(githubusername)profileFields.githubusername=githubusername;
if(skills){
    profileFields.skills=skills.split(',').map(skill=>skill.trim())
}
//Build social object
profileFields.social={}
if(youtube)profileFields.social.youtube=youtube;
if(twitter)profileFields.social.twitter=twitter;
if(facebook)profileFields.social.facebook=facebook;
if(linkedin)profileFields.social.linkedin=linkedin;
if(instagram)profileFields.social.instagram=instagram;

try{
    let profile=await Profile.findOne({user:req.user.id});
    if(profile){
        //update
        profile=await Profile.findOneAndUpdate({user:req.user.id},
            {$set:profileFields},
            {new:true}
        );
        return res.json(profile);
    }
    //create
    profile=new Profile(profileFields);
    await profile.save();
    res.json(profile);
}catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
}
})
//@route        POST api/profile/me
//@description  create or update user profile
//@access      private
router.get('/',async(req,res)=>{
    try {
        const profiles=await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route        POST api/profile/user/:user_id
//@description  get profile by user id 
//@access      Public
router.get('/user/:user_id',async(req,res)=>{
    try {
       
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
         if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
        res.status(500).send('Server Error');
        }
    
})
module.exports = router;