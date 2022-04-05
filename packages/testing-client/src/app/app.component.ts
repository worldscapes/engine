import { Component, OnInit } from '@angular/core';

import {
  ComponentPurposes, ComponentSelector,
  ECRApi, ECRQuery, EntityRequest,
  NetworkAdapterApi,
  SimpleEcr,
  UserAction,
} from "@worldscapes/common";
import {
  SimpleClientSimulation,
  SimpleEngineClient,
  SimpleNetworkClient,
  WebsocketClientNetworkAdapter,
  WorldscapesClientApi
} from "@worldscapes/client";
import { Observable, shareReplay } from 'rxjs';
import {CardShuffle} from "@worldscapes/testing-common";

class AddOneCardAction extends UserAction {}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'testing-client';

  adapter!: NetworkAdapterApi;
  client!: WorldscapesClientApi;
  ecr!: ECRApi;

  timestamp!: number;

  cards!: Observable<any>;

  ngOnInit(): void {
    (async () => {
      this.adapter = new WebsocketClientNetworkAdapter("localhost");
      await this.adapter.isReady();

      this.ecr = new SimpleEcr();

      this.cards = new Observable(observer => {
        this.ecr.subscribeDataQuery(
          ECRQuery.create({
            entity: {
              cards: new EntityRequest({
                shuffle: new ComponentSelector(ComponentPurposes.READ, CardShuffle),
              })
            },
            resource: {}
          }),
          (data) => {
            observer.next(data.entity.cards.map(entity => entity.shuffle.cards));
          }
        )
      }).pipe(shareReplay(1));

      this.client = new SimpleEngineClient(
          new SimpleClientSimulation(this.ecr),
          new SimpleNetworkClient(this.adapter)
      );
      this.client.start();
    })();
  }

  addOneCard(): void {
    this.client.onInput(new AddOneCardAction());
  }
}
