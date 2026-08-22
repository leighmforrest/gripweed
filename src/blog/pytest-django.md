---
title: "Test That Jawn: pytest-django"
pubDate: 2026-08-20
author: "Leigh Michael Forrest"
image:
  url: "https://docs.astro.build/default-og-image.png"
  alt: "The Astro logo against a dark background with planets."
---

Automated testing is an important part of writing software in any language. But it is often poorly explained in documentation and in tutorials. In this post, I will explain how to test a Django application using pytest, a popular test runner, and pytest-django, a Python package used for testing Django projects in Python. Pytest handles the testing machinery, and pytest-django
connects Django to that machinery. By the end of this post, you'll be able to install pytest
in a Django project, write a basic test, create and use fixtures, test database-backed code, and
organize tests for Django models and views.


## Setup

To set up your django project to run pytest, you need to follow some steps. First, we need to install the required packages.


```bash
python -m pip install pytest pytest-django pytest-cov
mkdir tests
touch tests/__init__.py tests/conftest.py
```

The packages we installed are:

- pytest: the pytest runner
- pytest-django: tools used to test Django in pytest
- pytest-cov: tool used to find gaps in test coverage

We also need to setup the `tests` directory, make it a Python module, and have a `conftest.py` file. More on this later.

Next, we need to have the test runner be able to discover the settings
used for the application.

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = django_project.settings
```

Finally, we need to keep the files we don't need to test out of the coverage reports with the .coveragerc file in the root directory.

```
# .coveragerc
[run]
omit =
    **/migrations/*
    tests/*
    django_project/*
    manage.py
```

## The Basics

One advantage of pytest is that we can use just ordinary Python expressions rather than
relying on specialized assertion methods such as `self.assertEqual`

```python
def test_evaluates_to_true():
    assert True
```

Notice that the function starts with `test_`. pytest will pick up the test function only if it can recognize it as a test function e.g. begin the function with `test_` If it begins with `evaluates_to_true` the test runner will not run it.

## Fixtures

When testing with pytest, you may need to have objects and other constructs that need to be used over and over again. This is where fixtures come in. You create one like this:

```python
import pytest

@pytest.fixture
def dohickey():
    return {'true': True}
```

and use one like this:

```python
def test_dohickey(dohickey):
    assert dohickey['true'] is True
```

The fixture name is an argument to the test function and can use its interface.

There are fixtures that are automatically available to the programmer. Three of them are:

- `db`: ensures the database is set up for the tests.
- `mailoutbox`: a fixture that captures emails sent during the test. Instead of sending out
    emails, messages can be inspected in mailoutbox.

    ```python
    len(mailoutbox) == 1
    assert email = mailoutbox[0]
    assert email.to == ["test@example.com"]
    ```
- `client`: a test client.

### Really Useful Custom Fixtures

Now let's apply this to a real project. In `conftest.py` there are some functions you may need throughout your tests.

```python
# conftest.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture(autouse=True)
def _media_storage(settings, tmp_path):
    settings.STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    return User.objects.create_user(
        email="testuser@example.com",
        password="testpass1234",
    )


@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(test_user)

    yield api_client
```

`_media_storage` will have a temporary directory for media uploads. You can query if a file was uploaded by using `Path` methods on the `tmp_path` fixture. Notice the `autouse=True` argument. This means the fixture will be used in all tests automatically, without invoking it in the function arguments.

`test_user` is a general purpose user for testing authenticated requests (mainly).

`api_client` is a testing client tailor made for use with Django Rest Framework.

`authenticated_client` returns a client that can access endpoints that need authentication. Notice it takes the `api_client` and `test_user` fixtures (yes, you can use fixtures to make fixtures) and returns a client.

## Markers

When we are testing our projects, we may need to have tests categorized and marked as so. This is where markers come in. You can create custom markers and use them, but they
are out of the scope of this blog post. In virtually any Django testing, though, you will be
using `@pytest.mark.django_db`. This marker tells pytest-django the test needs database access.
If the marker isn't used, the tests will not work if they
hit the database. You can use it like this:

```python
import pytest

from myapp.models import Gimgaw

@pytest.mark.django_db
def test_create_gimgaw():
    gimgaw = Gimgaw.objects.create(name="Roderick")
    assert gimgaw.pk is not None
    assert Gimgaw.objects.count() == 1
```

But if you have a whole bunch of tests that hit the database, there is an easier way:

```python
import pytest

from myapp.models import Gimgaw

pytestmark = pytest.mark.django_db

def test_create_gimgaw():
    gimgaw = Gimgaw.objects.create(name="Roderick")
    assert gimgaw.pk is not None
    assert Gimgaw.objects.count() == 1
```

So now we have an umbrella marker for all of the tests in the file. Instead of
marking each function individually, they are marked automatically. We'll lean on this
`pytestmark` pattern in every test file for the rest of the post.

## Class Based Tests

When testing Django projects, it is often useful to group related tests, and have them run
together. We can group them together in ordinary Python classes. Notice these are plain Python classes, and not `TestCase` classes from stock Django testing. The class name must begin
with `Test` for the test runner to pick it up. The only thing that changes for test functions
is that they must have `self` as the first argument, as the test function is now a class method.

```python
class TestThing:
    def test_is_true(self):
        assert True

    def test_is_false(self):
        assert not True
```

### Model Tests

Testing individual models is a good practice, and here is a small but important test class. We're moving from the toy `Gimgaw` example to a real model, `Post`, that we'll test throughout the rest of the post:

```python
# test_post.py
import pytest

pytestmark = pytest.mark.django_db


class TestPost:
    def test_post_exists(self, test_post):
        assert 0 < len(test_post.title) <= 50
        assert len(test_post.body) > 0
        assert test_post.created is not None
        assert test_post.modified is not None

    def test___str__(self, test_post):
        assert test_post.title == str(test_post)
```

Notice we have the umbrella marker, as the models are database matters. And we are
using expressions to test what we want from the field, e.g. existence, length, minimum length.
It's always a good idea to test a model's `__str__` method, especially when the
string representation is used in the admin and elsewhere in a Django project.

### List View Tests

I often group view tests by list views and detail views. Here is a list view from an existing project:

```python
# test_post_list_view.py
import pytest
from rest_framework import status
from pytest_django.asserts import assertContains
from django.urls import reverse, resolve

from apps.posts.views import PostListView


pytestmark = pytest.mark.django_db


class TestPostListView:
    def get_url(self):
        return reverse("posts:list")

    def test_view(self, test_five_posts, authenticated_client):
        response = authenticated_client.get(self.get_url())

        assert response.status_code == status.HTTP_200_OK

        for post in test_five_posts:
            assertContains(response, post)

    def test_view_anonymous_user_cannot_access(self, test_five_posts, client):
        response = client.get(self.get_url())

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_view_anonymous_user_cannot_create(self, client):
        response = client.post(self.get_url(), data={"title": "green data", "body": "howdy!"})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_view_authenticated_user_can_create(self, authenticated_client):
        response = authenticated_client.post(
            self.get_url(), data={"title": "green data", "body": "howdy!"}
        )

        assert response.status_code == status.HTTP_201_CREATED

    def test_view_url_resolves_post_list_view(self):
        view = resolve(self.get_url())
        assert view.func.view_class is PostListView
```

A quick note on that `401` vs `403`: which status code an unauthenticated request gets back
depends on your authentication classes. DRF's default `IsAuthenticated` permission returns
`401 UNAUTHORIZED` when the authenticator supports a challenge (like `TokenAuthentication` or
JWT auth), and `403 FORBIDDEN` when it doesn't (like `SessionAuthentication` without a
`WWW-Authenticate` header). If you're on JWT auth, as above, expect `401`.

I also swapped the class-level `url = reverse(...)` for a `get_url()` method. Computing the
URL as a class attribute runs at test *collection* time rather than at test *run* time, which
can bite you depending on how early your URLconf is ready. A method call sidesteps that, and
it keeps the list view test consistent with the detail view test below.

In the tests, we use the `authenticated_client` like so:
```python
response = authenticated_client.post(
    self.get_url(), data={"title": "green data", "body": "howdy!"}
)
```
The `authenticated_client` is like the ordinary `api_client`, it's just authenticated automatically
with `test_user`. And we get the response data back from the request.

I want to point out the use of `status`. You import the status codes with `from rest_framework import status`. You will want to check the status codes of DRF requests using `status.*`. It contains all of the status codes you will want to assert against: `status.HTTP_200_OK`, `status.HTTP_401_UNAUTHORIZED`, `status.HTTP_201_CREATED`.

It is a good practice to test whether the URL resolves to the view class it's supposed to.
In `test_view_url_resolves_post_list_view`, the test resolves the class' URL, and asserts
that the `view_class` is `PostListView`.

### Detail View Tests

To test detail views, it's not very much different. But there are some important details:

```python
# test_post_detail_view.py
import pytest
from rest_framework import status
from pytest_django.asserts import assertContains
from django.urls import reverse, resolve

from apps.posts.views import PostDetailView


pytestmark = pytest.mark.django_db


class TestPostDetailView:
    def get_url(self, pk):
        return reverse("posts:detail", args=[pk])

    def test_view(self, test_post, authenticated_client):
        response = authenticated_client.get(self.get_url(test_post.pk))

        assert response.status_code == status.HTTP_200_OK
        assertContains(response, test_post)

    def test_view_url_resolves_post_detail_view(self, test_post):
        view = resolve(self.get_url(test_post.pk))
        assert view.func.view_class is PostDetailView
```

The most important detail is that we get the URL with a method: `get_url()`. Given an
existing model, we can get a URL for that model. We can invoke it with `self.get_url(test_post.pk)`
whenever we need to.

And `assertContains()`? We are not precluded from using the assertion methods from the conventional
Django tests. pytest-django allows us to use all of these assertion methods in our tests as functions. We can import the ones we want like this:

```python
from pytest_django.asserts import assertTemplateUsed
```

In our case, `assertContains` is imported into the test file. To use it, we pass in the
response from the client and the data we expect: `assertContains(response, test_post.title)` by itself; never `assert assertContains(response, test_post.title)`. The function itself runs the assertion.

## Conclusion

In this post, I showed you how to set up pytest-django from installation to creating a
complete set of tests for a Django application. Fixtures are infrastructure that allows object
reuse throughout your tests. `@pytest.mark.django_db` (or the file-level `pytestmark` shortcut)
signals that a test needs database access. And we can group related test methods together in
an ordinary Python class. This is the basic way we use pytest-django, and you can now create
tests for your own project.

If you want to see where the gaps are, run pytest with coverage:

```bash
pytest --cov=apps --cov-report=term-missing
```

That'll print a report showing which lines in your app code aren't hit by any test — a good next
place to look once you've got the basics from this post down.