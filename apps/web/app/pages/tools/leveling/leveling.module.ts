import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LevelXpComponent } from './level-xp.component'
import { LevelingComponent } from './leveling.component'
import { TradeskillsComponent } from './tradeskills.component'
import { WeaponsComponent } from './weapons.component'

const routes: Routes = [
  {
    path: '',
    component: LevelingComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'xp'
      },
      {
        path: 'xp',
        component: LevelXpComponent,
      },
      {
        path: 'tradeskills',
        component: TradeskillsComponent,
      },
      {
        path: 'weapons',
        component: WeaponsComponent,
      }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [],
})
export class LevelingModule {
  //
}
