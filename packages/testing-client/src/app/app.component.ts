import { Component, OnInit } from '@angular/core';

import {NetworkAdapterApi, SimpleEcr, UserAction, WorldStateSnapshot} from "@worldscapes/common";
import {
  DisplayApi,
  SimpleClientSimulation,
  SimpleEngineClient,
  SimpleNetworkClient,
  WebsocketClientNetworkAdapter,
  WorldscapesClientApi
} from "@worldscapes/client";

class AddOneCardAction extends UserAction {}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'testing-client';

  display!: DisplayApi;
  adapter!: NetworkAdapterApi;
  client!: WorldscapesClientApi;

  snapshot!: WorldStateSnapshot;
  timestamp!: number;

  ngOnInit(): void {
    (async () => {
      this.adapter = new WebsocketClientNetworkAdapter("localhost");
      await this.adapter.isReady();

      this.display = {
        takeUpdatedSnapshot: this.updateSnapshot.bind(this)
      };

      this.client = new SimpleEngineClient(
          new SimpleClientSimulation(new SimpleEcr()),
          new SimpleNetworkClient(this.adapter),
          this.display
      );
      this.client.start();
    })();
  }

  updateSnapshot(snapshot: WorldStateSnapshot): void {
    this.snapshot = snapshot;
    this.timestamp = Date.now();
  }

  addOneCard(): void {
    this.display?.onInput?.(new AddOneCardAction());
  }
}
