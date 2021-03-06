import 'reflect-metadata';
import { NestContainer, InstanceWrapper } from '../core/injector/container';
import { NestGateway } from './interfaces/nest-gateway.interface';
import { SocketsContainer } from './container';
import { WebSocketsController } from './web-sockets-controller';
import { Injectable } from '../common/interfaces/injectable.interface';
import { SocketServerProvider } from './socket-server-provider';
import { GATEWAY_METADATA } from './constants';

export class SocketModule {
    private static socketsContainer = new SocketsContainer();
    private static webSocketsController: WebSocketsController;

    public static setup(container: NestContainer) {
        this.webSocketsController = new WebSocketsController(
            new SocketServerProvider(this.socketsContainer),
            container,
        );

        const modules = container.getModules();
        modules.forEach(({ components }, moduleName) => this.hookGatewaysIntoServers(components, moduleName));
    }

    public static hookGatewaysIntoServers(components: Map<string, InstanceWrapper<Injectable>>, moduleName: string) {
        components.forEach(({ instance, metatype, isNotMetatype }) => {
            if (isNotMetatype) return;

            const metadataKeys = Reflect.getMetadataKeys(metatype);
            if (metadataKeys.indexOf(GATEWAY_METADATA) < 0) return;

            this.webSocketsController.hookGatewayIntoServer(
                instance as NestGateway,
                metatype,
                moduleName,
            );
        });
    }

}