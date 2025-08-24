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
//@route        DELETE api/profile
//@description  delete profile ,user&posts
//@access      Private
router.delete('/',auth,async(req,res)=>{
    try {
        //todo remove posts
        //Remove profile
        await Profile.findOneAndDelete({user:req.user.id})
       //remove user
        await Profile.findOneAndDelete({_id:req.user.id})
        
        res.json({msg:'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        }
    
})
//@route        PUT api/profile/experiance
//@description  add profile experiance
//@access      Private
router.put('/experiance',[auth,
    [check('title','Title is required').notEmpty(),
        check('company','Company is required').notEmpty(),
        check('from','From date is required').notEmpty(),
    ]
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body;
    const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile=await Profile.findOne({user:req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
//@route        DELETE api/profile/experiance/:exp_id
//@description  delete profile experiance
//@access      Private
router.delete('/experiance/:exp_id',auth,async(req,res)=>{
     try {
       const profile=await Profile.findOne({user:req.user.id});
       //get remove index
       const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

       profile.experience.splice(removeIndex,1);

       await profile.save();
        
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        }
})

//@route        PUT api/profile/education
//@description  add profile education
//@access      Private
router.put('/education',[auth,
    [check('school','School is required').notEmpty(),
        check('degree','Degree is required').notEmpty(),
        check('fieldofstudy','Field of Study is required').notEmpty(),
        check('from','From date is required').notEmpty(),
    ]
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body;
    const newEdu={
         school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile=await Profile.findOne({user:req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
//@route        DELETE api/profile/experianceeducation/:exp_id
//@description  delete profile education
//@access      Private
router.delete('/education/:edu_id',auth,async(req,res)=>{
     try {
       const profile=await Profile.findOne({user:req.user.id});
       //get remove index
       const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.exp_id);

       profile.education.splice(removeIndex,1);

       await profile.save();
        
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        }
})
module.exports = router;