// Vendor
import { Sound } from 'pizzicato';
import { Loader } from 'resource-loader';

class PizzicatoAudioLoader extends Loader {
    /**
     * Public
     */
    load({ path, options = {} }) {
        const promise = new Promise((resolve) => {
            const sound = new Sound(path, () => {
                resolve(sound);
            });
        });

        return promise;
    }
}

export default PizzicatoAudioLoader;
