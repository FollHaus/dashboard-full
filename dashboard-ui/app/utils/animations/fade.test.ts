import { FADE_IN } from './fade'

describe('FADE_IN utility', () => {
  it('contains fade animation config', () => {
    expect(FADE_IN.initial).toEqual({ opacity: 0 })
    expect(FADE_IN.whileInView).toEqual({ opacity: 1 })
    expect(FADE_IN.transition).toEqual({ duration: 0.6 })
  })
})
