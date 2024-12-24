const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const crypto = require('crypto');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc)
const network = bitcoin.networks.mainnet;

// 1-1. aezeedのニーモニックフレーズからエントロピーを生成
//const mnemonic_aezeed = '';
//const cipherSeed1 = CipherSeed.fromMnemonic(mnemonic_aezeed, '');
//console.log('cipher seed:', cipherSeed1.entropy);
//console.log('seed birthdate:', cipherSeed1.birthDate);

// 2-1. エントロピーから24ワードのニーモニックフレーズを生成
//const mnemonic = bip39.entropyToMnemonic(cipherSeed1.entropy.toString('hex'));
//console.log('Mnemonic:', mnemonic);

// 1. 256ビットのエントロピーを生成
const entropy = crypto.randomBytes(32);
console.log('Entropy:', entropy.toString('hex'));

// 2. エントロピーから24ワードのニーモニックフレーズを生成
const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'));
console.log('Mnemonic:', mnemonic);
//const mnemonic =  ""

// 3. ニーモニックフレーズからシードを生成
const seed = bip39.mnemonicToSeedSync(mnemonic);
console.log('Seed:', seed.toString('hex'));

// 4. シードからHDウォレットを生成
const root = bip32.fromSeed(seed, network);

const xpriv = root.derivePath("m/84'/0/0").toBase58();

const xpub = [];
const pubkey = [];
const addresses_p2wpkh = [];
const addresses_p2shP2wpkh = [];
const addresses_p2shP2wsh = [];
const addresses_p2wsh = [];

const xpub_i = root.derivePath(`m/84'/0'/0'`).neutered().toBase58();
//const xpriv = root.derivePath("m/84'/0/0").toBase58();
xpub.push(xpub_i);
const pubkeyNode = bip32.fromBase58(xpub_i, network);

for (let i = 0; i < 10; i++) {
    //const xpub_i = root.derivePath(`m/44'/0'/0'/0/${i}`).neutered().toBase58();
    //xpub.push(xpub_i);
    //const pubkeyNode = bip32.fromBase58(xpub_i, network);
    //const pubkey_i = pubkeyNode.derive(1).derive(0).derive(0).derive(i).publicKey;
    const pubkey_i = pubkeyNode.derive(0).derive(i).publicKey;
    pubkey.push(pubkey_i)

    const pubkeys_i = [
      pubkey_i,
    ].map(Buffer => Buffer);

    const address_p2shP2wpkh = getP2shP2wpkhAddress(pubkey_i);
    addresses_p2shP2wpkh.push(address_p2shP2wpkh)

    const address_p2wpkh = getP2wpkhAddress(pubkey_i);
    addresses_p2wpkh.push(address_p2wpkh)

    const address_p2shP2wsh = getP2shP2wshAddress(pubkeys_i);
    addresses_p2shP2wsh.push(address_p2shP2wsh)

    const address_p2wsh = getP2wshAddress(pubkeys_i);
    addresses_p2wsh.push(address_p2wsh)

  }

function getP2shP2wpkhAddress(pubkey){
  const address = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network: network, })
  }).address;
  return address;
}

function getP2wpkhAddress(pubkey){
  const address = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: network, }).address;
  return address;
}

function getP2shP2wshAddress(pubkeys){
  const address = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wsh({
          redeem: bitcoin.payments.p2ms({ m: 1, pubkeys, network: network, })
      }),
  }).address;
  return address;
}

function getP2wshAddress(pubkeys){
  const address = bitcoin.payments.p2wsh({
      redeem: bitcoin.payments.p2ms({ m: 1, pubkeys, network: network, }),
  }).address;
  return address;
}

//const xpub = root.derivePath("m/44'/1/0").neutered().toBase58();

console.log("xpriv: ", xpriv);
console.log("xpub: ", xpub);
console.log("addresses_p2wpkh: ", addresses_p2wpkh);
console.log("addresses_p2shP2wpkh: ", addresses_p2shP2wpkh);
console.log("addresses_p2shP2wsh: ", addresses_p2shP2wsh);
console.log("addresses_p2wsh: ", addresses_p2wsh);

//const pubkeyNode = bip32.fromBase58(xpub, network);
//const pubkey = pubkeyNode.derive(1).derive(0).derive(0).derive(0).publicKey;

//function getP2wpkhAddress(){
//    const address = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: network, }).address;
//    return address;
//}

//const p2wpkhAddress = getP2wpkhAddress();
//log("P2WPKH :", p2wpkhAddress);

// 5. 受け取り用アドレスとおつり用アドレスをSegWitで100個生成
/*
const receiveAddresses = [];
const changeAddresses = [];

for (let i = 0; i < 100; i++) {
  // 受け取り用アドレスの生成
  const receiveAccount = root.derivePath(`m/44'/0'/0'/0/${i}`);
  const receiveKeyPair = bitcoin.ECPair.fromPrivateKey(receiveAccount.privateKey);
  const { address: receiveAddress } = bitcoin.payments.p2wpkh({ pubkey: receiveKeyPair.publicKey });
  receiveAddresses.push(receiveAddress);

  // おつり用アドレスの生成
  const changeAccount = root.derivePath(`m/44'/0'/0'/1/${i}`);
  const changeKeyPair = bitcoin.ECPair.fromPrivateKey(changeAccount.privateKey);
  const { address: changeAddress } = bitcoin.payments.p2wpkh({ pubkey: changeKeyPair.publicKey });
  changeAddresses.push(changeAddress);
}

console.log('Receive Addresses:', receiveAddresses);
console.log('Change Addresses:', changeAddresses);
*/