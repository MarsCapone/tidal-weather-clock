'use client'

import Image from 'next/image'
import birthday from './birthday.jpg'

export default function Page() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row">
        <div className="">
          <Image
            className="aspect-auto max-w-xs rounded-lg shadow-xl md:max-w-sm"
            alt={'samson & katherine after going to bank hole'}
            src={birthday}
            width={400}
            height={300}
          />
        </div>
        <div className={'w-1/2'}>
          <h1 className="text-5xl font-bold">Happy Birthday!</h1>
          <div className="items-start py-4">
            <p className="">
              I started making this after you mentioned it early July.{' '}
            </p>
            <p className="pt-4">
              Not everything&apos;s perfect, but I&apos;ll keep maintaining it
              and my hope is that you don&apos;t have to look at multiple
              different places to work out what to do tomorrow.
            </p>
            <p className="pt-8">Much love,</p>
            <p className="">Samson</p>
            <p className="pt-10 text-sm">
              P.S. This website has gone through many iterations. You previously
              mentioned a clock... how do you represent more than 12 hours
              clearly?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
