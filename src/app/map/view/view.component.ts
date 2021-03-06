import {AfterViewInit, Component} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import {MarkerService} from '../services/marker.service';
import {StatistiqueService} from '../services/statistique.service';
import {UserService} from "../../user/services/user.service";
import {User} from "../../user/data/User";
import {GeoJsonObject} from 'geojson';

@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css']
})
export class ViewComponent implements AfterViewInit {
    users: User[] = [];
    private map!: L.Map;
    private baseLayers: any;
    private layersControler: any;

    constructor(
        private markerService: MarkerService,
        private userService: UserService,
        private statistiqueService: StatistiqueService
    ) {
    }

    ngAfterViewInit() {
        this.initMap();
        this.getUsers();
        this.initIsochronesLayer()
    }

    private initMap(): void {
        const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
        const mapboxUrl = 'https://api.mapbox.com/styles/v1/sangis/cjz8itspx0b771cqfmhddl6sx/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2FuZ2lzIiwiYSI6Ii1YT3B3encifQ.DuJG8BEzs7jc79vHmB4ytg';
        const fonds_noir = L.tileLayer(mapboxUrl, {
            id: 'mapbox/Moonlight',
            tileSize: 512,
            zoomOffset: -1,
            attribution: mapboxAttribution
        });

        const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 3,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            className: "OSM"
        });

        this.map = L.map('map', {
            center: [43.765, 3.641],
            zoom: 9,
            layers: [streets]
        });

        this.baseLayers = {
            'Streets': streets,
            'Moonlight': fonds_noir
        };
    }

    getUsers() {
        this.userService.getAllPublicUser().subscribe(
            (users) => {
                this.users = users;
                this.addMarkers()
            },
            error => {
                console.error(error)
            }
        )
    }

    addMarkers() {
        let overlays = this.markerService.makeCapitalMarkers(this.map, this.users);
        this.layersControler = L.control.layers(this.baseLayers, overlays, {collapsed: false}).addTo(this.map);
    }

    private initIsochronesLayer() {
        this.statistiqueService.getIsochroneStats().subscribe(
            (isochrones: GeoJsonObject | undefined) => {
                if (isochrones) {
                    const isochroneLayer = L.geoJSON(isochrones, {

                        style: (feature) => {
                            if (feature) {
                                switch (feature.properties.AA_MINS) {
                                    case 15:
                                        return {color: "#ff0000"};
                                    case 30:
                                        return {color: "#00ff00"};
                                    case 45:
                                        return {color: "#0000ff"};
                                    case 60:
                                    default:
                                        return {color: "#00f0f0"};
                                }
                            } else {
                                return {
                                    weight: 3,
                                    opacity: 0.5,
                                    color: '#008f68',
                                    fillOpacity: 0.8,
                                    fillColor: '#6DB65B'
                                }
                            }
                        }
                    });
                    this.layersControler.addOverlay(isochroneLayer, 'Zone d\'activité').addTo(this.map)
                }
            }
        )
    }
}
