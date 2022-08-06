require('dotenv').config()
const ENV = process.env.ENV

const setCookie_ =(type, status, res)=>{

    res.cookie("status", status, {
        secure: ENV === 'dev' ? false : true,
        maxAge: Number(process.env.COOKIE_REFRESHTOKEN_DURATION),
    });

    res.cookie("type", type, {
        secure: ENV === 'dev' ? false : true,
        maxAge: Number(process.env.COOKIE_REFRESHTOKEN_DURATION),
    });
}



function setCookie(accesstoken, refreshtoken, res, user){
    
    res.cookie("accesstoken", accesstoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_ACCESSTOKEN_DURATION),
        secure: ENV === 'dev' ? false : true,
    });

    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_REFRESHTOKEN_DURATION),
        secure: ENV === 'dev' ? false : true,
    });

    //check if user is blocked
    if(user.isBlocked){
        user.isAdmin ? setCookie_('admin', 'blocked',  res) : setCookie_('user', 'blocked',  res)

    }else{
        if(user.isVerified){
            user.isAdmin ? setCookie_('admin', 'verirified',  res) : setCookie_('user', 'verirified',  res)

        }else{
            user.isAdmin ? setCookie_('admin', 'unverirified',  res) : setCookie_('user', 'unverirified',  res)
        }
    }
}

module.exports = setCookie