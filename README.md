# Path Approximation with Fourier Series

This application approximates arbitrary shapes with a series of Fourier terms.

We load shapes from `SVG` files. After loading the file, paramters are determined automatically and we display an animated view of the approximated shape.

The approximation can suffer when the shapes direction does not match the approximation. In this case the `Reverse` button can invert the order within the loaded shape.

We use a slider to change the number of terms that are used to approximate the shapes. Higher numbers of terms fit the original shape closer, but also run a risk of numeric instability.

# Installation

1. Install node (with npm).
2. Clone this repository.
3. Install dependencies and produce output with ```npm install```.
4. Open `index.html` to view the application.