const IPFS = require('ipfs-http-client');
let ipfs;
try{
  console.log('Attempting to load local IPFS node...');
  ipfs = new IPFS({ host: 'localhost', port: 5001, protocol: 'http' });
  console.log('Success!');
} catch(e) {
  console.log('Failed. Loading Infura IPFS node...');
  ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
  console.log('Success!')
}

export default ipfs;
