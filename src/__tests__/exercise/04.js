// form testing
// http://localhost:3000/login

import * as React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../components/login'
import {build, fake} from '@jackfranklin/test-data-bot'

function buildLoginForm(overrides) {
  const LoginFormBuilder = build('Login Form', {
    fields: {
      username: fake(f => f.internet.userName()),
      password: fake(f => f.internet.password()),
      ...overrides,
    },
  })
  return LoginFormBuilder()
}

test('submitting the form calls onSubmit with username and password', async () => {
  const handleSubmit = jest.fn()
  //
  // 🐨 render the login with your handleSubmit function as the onSubmit prop
  render(<Login onSubmit={handleSubmit} />)

  const usernameElement = screen.getByLabelText('Username')
  const passwordElement = screen.getByLabelText('Password')
  const {username: testUsername, password: testPassword} = buildLoginForm({
    password: '123',
  })

  await userEvent.type(usernameElement, testUsername)
  await userEvent.type(passwordElement, testPassword)
  // 🐨 click on the button with the text "Submit"
  await userEvent.click(screen.getByRole('button', {name: 'Submit'}))
  // assert that submittedData is correct
  // 💰 use `toEqual` from Jest: 📜 https://jestjs.io/docs/en/expect#toequalvalue
  expect(handleSubmit).toHaveBeenCalledWith({
    username: testUsername,
    password: testPassword,
  })
})

/*
eslint
  no-unused-vars: "off",
*/
