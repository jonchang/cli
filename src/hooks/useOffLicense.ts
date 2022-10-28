import { Stowage } from "types"
import { host } from "utils"

type Type = 's3' | 'ipfs'

export default function useOffLicense(_type: Type) {
  switch(_type){
    case "s3": return{url, key}
    case "ipfs": return{url: ipfsUrl, key: ipfsKey}
  }
}

function key(stowage: Stowage) {
  let rv = stowage.pkg.project
  if (stowage.type == 'bottle') {
    const { platform, arch } = stowage.host ?? host()
    rv += `/${platform}/${arch}`
  }
  rv += `/v${stowage.pkg.version}`
  if (stowage.type == 'bottle') {
    rv += `.tar.${stowage.compression}`
  } else {
    rv +=  stowage.extname
  }
  return rv
}

function url(stowage: Stowage) {
  return new URL(`https://dist.tea.xyz/${key(stowage)}`)
}

async function ipfsUrl(stowage: Stowage) {
  const urlKey = await ipfsKey(stowage)

  if(urlKey == "No CID file in S3"){
    return "No CID file in S3"
  }
  else{
    return new URL(`https://ipfs.tea.xyz/ipfs/${urlKey}`)
  }
}

async function ipfsKey(stowage: Stowage) {
  const urlCID = new URL(url(stowage) + '.cid')

  try{
    const cid = await (async () => {
      const rsp = await fetch(urlCID)
      if (!rsp.ok) throw rsp
      const txt = await rsp.text()
      return txt.split(' ')[0]
    })()

    return cid

  } catch(err){
    console.log("Got error:: ", err, " Getting file from S3 now")
    return "No CID file in S3"
  }
}