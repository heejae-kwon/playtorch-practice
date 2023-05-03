import RNFS from 'react-native-fs'

let AssetList: RNFS.ReadDirItem[] = []
export async function prepareAssets() {
    let isExists = await RNFS.existsAssets('model/u2net.ptl');
    if (isExists) {
        await RNFS.copyFileAssets('model/u2net.ptl', RNFS.CachesDirectoryPath + '/u2net.ptl')//.then((re) => {
    }

    AssetList = await RNFS.readDir(RNFS.CachesDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
}

export function getAssetPath(assetName: string) {
    return AssetList.find(value => value.name === assetName)?.path!
}

/*
export async function readAsset(name: string, encodingOption: string) {
    return await RNFS.readFileAssets(name, encodingOption)
}

function isAssetsPrepared() {
    return AssetList.length !== 0
}
*/
