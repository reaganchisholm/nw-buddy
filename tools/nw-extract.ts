import { extract, convert, createFilter, createConverter } from 'nw-extract'
import { program } from 'commander'
import { env } from './env'
import { MultiBar, Presets } from 'cli-progress'
import * as path from 'path'

program
  .option('-g, --game <path>', 'game directory')
  .option('-o, --output <path>', 'output directory')
  .option('--ptr', 'PTR mode', ['true', 'yes', '1'].includes(process.env['NW_PTR']))
  .action(async () => {

    const options = program.opts<{ game: string, output: string, ptr: boolean }>()
    const filter: any[] = [
      '*',
      'datasheet:json',
      'locale:json',
      'icon:png',
      'image:png',
      '!server/**/*' as any,
      '!pregame/**/*' as any
    ]

    const bar = new MultiBar({
      stopOnComplete: true,
      clearOnComplete: false,
      hideCursor: true,
      format: '{bar} {percentage}% | {value}/{total} | {filename}'
    }, Presets.shades_grey)
    const b1 = bar.create(0, 0, {})
    const b2 = bar.create(0, 0)

    await extract({
      inputDir: options.game || env(options.ptr).gameDir,
      outputDir: options.output || env(options.ptr).dataDir,
      filter: createFilter(filter),
      converterFactory: createConverter(filter),
      onProgress: (p) => {
        b1.setTotal(p.mainTotal)
        b1.update(p.mainDone, { filename: p.mainInfo })

        b2.setTotal(p.subTotal || 1)
        b2.update(p.subDone, { filename: p.subInfo })
      }
    })
    bar.stop()
  })


program.parse()
