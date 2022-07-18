// mocking HTTP requests
// http://localhost:3000/login-submission

import * as React from 'react'
// 🐨 you'll need to grab waitForElementToBeRemoved from '@testing-library/react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {build, fake} from '@jackfranklin/test-data-bot'
// 🐨 you'll need to import rest from 'msw' and setupServer from msw/node
import Login from '../../components/login-submission'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {handlers} from 'test/server-handlers'

const buildLoginForm = build({
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  },
})

// 🐨 get the server setup with an async function to handle the login POST request:
// 💰 here's something to get you started
const server = setupServer(...handlers)
// you'll want to respond with an JSON object that has the username.
// 📜 https://mswjs.io/

// 🐨 before all the tests, start the server with `server.listen()`
beforeAll(() => {
  server.listen()
})
// 🐨 after all the tests, stop the server with `server.close()`
afterAll(() => {
  server.resetHandlers()
  server.close()
})

test(`logging in displays the user's username`, async () => {
  render(<Login />)
  const {username, password} = buildLoginForm()

  await userEvent.type(screen.getByLabelText(/username/i), username)
  await userEvent.type(screen.getByLabelText(/password/i), password)
  // 🐨 uncomment this and you'll start making the request!
  await userEvent.click(screen.getByRole('button', {name: /submit/i}))

  // as soon as the user hits submit, we render a spinner to the screen. That
  // spinner has an aria-label of "loading" for accessibility purposes, so
  // 🐨 wait for the loading spinner to be removed using waitForElementToBeRemoved
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitforelementtoberemoved
  await waitForElementToBeRemoved(() => screen.getByLabelText('loading...'))

  // once the login is successful, then the loading spinner disappears and
  // we render the username.
  // 🐨 assert that the username is on the screen
  expect(screen.getByText(username)).toBeInTheDocument()
})

test(`logging in without a password fails`, async () => {
  render(<Login />)
  const {username} = buildLoginForm()

  await userEvent.type(screen.getByLabelText(/username/i), username)
  // 🐨 uncomment this and you'll start making the request!
  await userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(await screen.findByLabelText('loading...'))

  await expect(screen.getByRole('alert')).toMatchInlineSnapshot(`
          <div
            role="alert"
            style="color: red;"
          >
            password required
          </div>
        `)
})

test(`logging in with a 500 throw an error`, async () => {
  render(<Login />)
  const {username, password} = buildLoginForm()

  server.use(
    rest.post(
      // note that it's the same URL as our app-wide handler
      // so this will override the other.
      'https://auth-provider.example.com/api/login',
      async (req, res, ctx) => {
        // your one-off handler here
        return res(
          ctx.delay(0),
          ctx.status(500),
          ctx.json({message: 'oopsie we messed up'}),
        )
      },
    ),
  )

  await userEvent.type(screen.getByLabelText(/username/i), username)
  await userEvent.type(screen.getByLabelText(/password/i), password)
  // 🐨 uncomment this and you'll start making the request!
  await userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(await screen.findByLabelText('loading...'))

  await expect(screen.getByRole('alert')).toMatchInlineSnapshot(`
          <div
            role="alert"
            style="color: red;"
          >
            oopsie we messed up
          </div>
        `)
})
