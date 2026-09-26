function retired(){return Response.json({error:'This service has been retired.'},{status:410,headers:{'Cache-Control':'no-store'}})}
export const GET=retired;
export const POST=retired;
