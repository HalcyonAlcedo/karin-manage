import { defineStore } from 'pinia';

export const useSnackbarStore = defineStore({
    id: 'snackbar',
    state: () => ({
        visible: false,
        msg: '',
        color: '',
        timeout: 5000,
        showClose: true
    }),
    actions: {
        open(msg: string, color = 'success') {
            this.msg = msg;
            this.color = color;
            this.visible = true;
            setTimeout(() => {
                this.visible = false;
            }, this.timeout);
        },
        close() {
            this.visible = false;
        }
    }
});
