extern crate wasm_bindgen;
extern crate aes_ctr;
extern crate hex;
#[macro_use]
extern crate lazy_static;
use aes_ctr::Aes192Ctr;
use aes_ctr::stream_cipher::generic_array::GenericArray;
use aes_ctr::stream_cipher::{
    NewStreamCipher, SyncStreamCipher, SyncStreamCipherSeek
};
use std::collections::HashMap;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;

lazy_static! {
     static ref cipherMap:Mutex<HashMap<String,Mutex<Aes192Ctr>>> = Mutex::new(HashMap::new());
}

#[wasm_bindgen]
pub fn decrypt(mut buffer: &mut[u8], key: &str) -> Vec<u8> {
    let mut cipherMapLock = cipherMap.lock().unwrap();
    let stringKey = String::from(key);
    if !cipherMapLock.contains_key(&stringKey)
    {
        let cipherKey = hex::decode("6b65796b65796b65796b65796b65796b65796b65796b6579").unwrap();
        cipherMapLock.insert(stringKey.to_string(), Mutex::new(Aes192Ctr::new_var(&cipherKey, &[0; 16]).unwrap()));
    }

    let mut cipher = cipherMapLock.get(&stringKey).unwrap().lock().unwrap();

    cipher.apply_keystream(&mut buffer);
    buffer[..].to_vec()
}

#[wasm_bindgen]
pub fn finish(key: &str)  {
    cipherMap.lock().unwrap().remove(&String::from(key));
    ()
}