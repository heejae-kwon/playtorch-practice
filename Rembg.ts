import {
    Image,
    media,
    Module,
    Tensor,
    torch,
    torchvision,
} from 'react-native-pytorch-core';
import { getAssetPath, prepareAssets } from './AssetHelper';

const T = torchvision.transforms;
const IMAGE_SIZE = 320;

let model: Module | null = null;

function norm_pred(d: Tensor) {
    const argMax = d.argmax()
    const argMin = d.argmin()
    const maxIdx = argMax.data()[0]
    const minIdx = argMin.data()[0]
    const ma = d.data()[maxIdx]
    const mi = d.data()[minIdx]

    return (d.sub(mi)).div(ma - mi)
}

export default async function removeBackground(image: Image) {
    // Get image width and height
    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();

    // Convert image to blob, which is a byte representation of the image
    // in the format height (H), width (W), and channels (C), or HWC for short
    const blob = media.toBlob(image);

    // Get a tensor from image the blob and also define in what format
    // the image blob is.
    let tensor = torch.fromBlob(blob, [imageHeight, imageWidth, 3]);

    // Rearrange the tensor shape to be [CHW]
    tensor = tensor.permute([2, 0, 1]);

    // Divide the tensor values by 255 to get values between [0, 1]
    tensor = tensor.div(255);

    // Resize the image tensor to 3 x min(height, IMAGE_SIZE) x min(width, IMAGE_SIZE)
    const resize = T.resize([IMAGE_SIZE, IMAGE_SIZE]);
    tensor = resize(tensor);

    // Center crop the image to IMAGE_SIZE x IMAGE_SIZE
    const centerCrop = T.centerCrop([IMAGE_SIZE]);
    tensor = centerCrop(tensor);


    // Unsqueeze adds 1 leading dimension to the tensor
    tensor = tensor.unsqueeze(0);

    // Load model if not loaded
    if (model == null) {
        console.log('Loading model...??');
        await prepareAssets()
        const u2netPath = getAssetPath('u2net.ptl')
        console.log(u2netPath, 'U2NET_PATH')
        //const filePath = await MobileModel.download(MODEL_URL);
        //console.log(filePath, 'FILE_PATH')
        model = await torch.jit._loadForMobile(u2netPath);
        console.log('Model successfully loaded');
    }

    let outputTensor: Tensor = await model.forward(tensor);

    // Squeeze removes dimension at 0 with size 1
    outputTensor = outputTensor[0].squeeze(0);

    outputTensor = norm_pred(outputTensor)

    // Multiply the tensor values by 255 to get values between [0, 255]
    // and convert the tensor to uint8 tensor
    outputTensor = outputTensor.mul(255).to({ dtype: torch.uint8 });

    const outputImage = media.imageFromTensor(outputTensor);

    // Convert the tensor to an image
    return outputImage;

}