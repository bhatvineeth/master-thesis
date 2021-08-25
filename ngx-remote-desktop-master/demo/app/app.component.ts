import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { WebSocketTunnel } from '@illgrenoble/guacamole-common-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';

import { RemoteDesktopManager } from '../../src/services';
import { ClipboardModalComponent } from './components';
import { randomBytes, createCipheriv } from 'crypto-browserify';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['../../src/themes/default.scss', './app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
    private manager: RemoteDesktopManager;

    constructor(private ngbModal: NgbModal,
        private snackBar: MatSnackBar) {

    }

    handleScreenshot(): void {
        this.manager.createScreenshot(blob => {
            if (blob) {
                FileSaver.saveAs(blob, `screenshot.png`);
            }
        });
    }

    createModal(classRef) {
        this.manager.setFocused(false);
        const modal = this.ngbModal.open(classRef, {
            size: 'lg',
            windowClass: 'modal-xxl',
            container: '.ngx-remote-desktop',
            keyboard: false
        });
        modal.componentInstance.manager = this.manager;
        return modal;
    }

    handleDisconnect(): void {
        this.manager.getClient().disconnect();
    }

    handleEnterFullScreen() {
        this.manager.setFullScreen(true);
    }

    handleExitFullScreen() {
        this.manager.setFullScreen(false);
    }

    handleClipboard(): void {
        const modal = this.createModal(ClipboardModalComponent);
        modal.result.then((text) => {
            this.manager.setFocused(true);
            if (text) {
                this.manager.sendRemoteClipboardData(text);
                this.snackBar.open('Sent to remote clipboard', 'OK', {
                    duration: 2000,
                });
            }
        }, () => this.manager.setFocused(true));
    }

    ngOnInit() {
			const encrypt = (value) => {
				const iv = randomBytes(16);
				const cipher = createCipheriv('AES-256-CBC', 'MySuperSecretKeyForParamsToken12', iv);
		
				let crypted = cipher.update(JSON.stringify(value), 'utf8', 'base64');
				crypted += cipher.final('base64');
		
				const data = {
						iv: iv.toString('base64'),
						value: crypted
				};
				return Buffer.from(JSON.stringify(data)).toString('base64');
		};

		const connectionString = encrypt(
			{
				"connection":{
					"type":"vnc",
					"settings":{
						"hostname":"192.168.0.103",
						"port":"5900",
						"username":"vineeth",
						"password":"vineeth",
						"security": "any",
						"ignore-cert": true,
						"width": "1680",
						"height": "1050"
					}
				}
			});
			
        // Setup tunnel. The tunnel can be either: WebsocketTunnel, HTTPTunnel or ChainedTunnel
        const tunnel = new WebSocketTunnel(`wss://localhost:8080/?token=${connectionString}`);
				

        /**
         *  Create an instance of the remote desktop manager by 
         *  passing in the tunnel
         */
        this.manager = new RemoteDesktopManager(tunnel);
        this.manager.connect();
        this.manager.onRemoteClipboardData.subscribe(text => {
            const snackbar = this.snackBar.open('Received from remote clipboard', 'OPEN CLIPBOARD', {
                duration: 1500,
            });
            snackbar.onAction().subscribe(() => this.handleClipboard());
        });
        this.manager.onReconnect.subscribe(reconnect => this.handleConnect());

    }

}
