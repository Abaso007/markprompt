import * as Dialog from '@radix-ui/react-dialog';
import cn from 'classnames';
import type { FieldProps, FormikTouched } from 'formik';
import { Field, Form, Formik } from 'formik';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import type { TypeOf } from 'zod';
import { object, string } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import LoadingDots from '@/components/ui/LoadingDots';

const salesFormSchema = object({
  firstName: string({ required_error: 'Please enter your first name' }),
  lastName: string({ required_error: 'Please enter your last name' }),
  email: string().email('Please enter a valid email'),
  message: string({ required_error: 'Please enter a message' }),
});

type SalesFormInputs = TypeOf<typeof salesFormSchema>;

type CustomFieldProps = {
  name: string;
  type: string;
  as?: string | React.ComponentType<FieldProps['field']>;
  placeholder?: string;
  className: string;
  touched: FormikTouched<any>;
  errors: any;
  setFieldError: (name: string, message: string | undefined) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  disabled: boolean;
};

const CustomField: FC<CustomFieldProps> = ({
  name,
  type,
  as,
  placeholder,
  className,
  touched,
  errors,
  setFieldError,
  setFieldTouched,
  disabled,
}) => {
  return (
    <Field
      type={type}
      name={name}
      as={as}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      data-error={touched[name] && errors[name]}
      onFocus={() => {
        setFieldError(name, undefined);
        setFieldTouched(name, false);
      }}
    />
  );
};

const FormSubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        'ring-offset-3 relative select-none overflow-hidden rounded-md border-0 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none ring-sky-500 ring-offset-neutral-900 transition hover:ring focus:ring disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:ring-0',
      )}
    >
      <span
        className={cn({
          'opacity-0': isSubmitting,
          'opacity-100': !isSubmitting,
        })}
      >
        Submit
      </span>
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center',
          {
            'opacity-100': isSubmitting,
            'opacity-0': !isSubmitting,
          },
        )}
      >
        <LoadingDots className={cn('bg-neutral-300')} />
      </div>
    </button>
  );
};

const submitForm = async (
  formId: string,
  values: {
    email: string;
    firstName: string;
    lastName: string;
    message: string;
  },
  resetForm: () => void,
  setSubmitting: (submitting: boolean) => void,
  setThanks: (submitting: boolean) => void,
  setOpen: (submitting: boolean) => void,
) => {
  setSubmitting(true);
  const email = values.email;
  await fetch('/api/support/contact', {
    method: 'POST',
    body: JSON.stringify({ ...values, email }),
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });

  setTimeout(() => {
    // Leave for an extra second, then hide form before
    // resetting the form.
    setThanks(true);
    setTimeout(() => {
      setSubmitting(false);
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => {
          resetForm();
          setThanks(false);
        }, 1000);
      }, 2000);
    }, 1000);
  }, 1000);
};

export const ContactSalesDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    if (open) {
      setThanks(false);
    }
  }, [open]);

  return (
    <>
      <div
        className={cn('pointer-events-none fixed inset-0 z-20 transition', {
          'opacity-0': !open,
          'opacity-100': open,
        })}
      >
        {/* Cover boundaries to prevent glitches when shown over
          the hero canvas animation */}
        <div className="fixed inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-1100 to-neutral-1100/0"></div>
        <div className="fixed inset-y-0 left-0 w-40 bg-gradient-to-r from-neutral-1100 to-neutral-1100/0"></div>
        <div className="fixed inset-y-0 right-0 w-40 bg-gradient-to-l from-neutral-1100 to-neutral-1100/0"></div>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="home-animate-overlay fixed inset-0 z-20 bg-black/70 backdrop-blur-xl" />
          <Dialog.Content className="home-animate-dialog-slide-in home-dialog-content hidden-scrollbar flex max-h-[90%] w-[90%] max-w-[560px] flex-col p-6 sm:p-8">
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex transform items-center justify-center p-8 text-sm delay-700 duration-700',
                {
                  '-translate-y-2 opacity-100': thanks,
                  'translate-y-0 opacity-0': !thanks,
                },
              )}
            >
              <p className="text-center text-neutral-300">Thank you!</p>
            </div>
            <div
              className={cn('relative transform duration-500', {
                'translate-y-4 opacity-0': thanks,
              })}
            >
              <Dialog.Title className="flex-grow text-lg font-medium text-white">
                Contact us
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-neutral-500">
                Contact us to learn more about our product and secure early
                access.
              </Dialog.Description>
              <Formik<SalesFormInputs>
                initialValues={{
                  firstName: '',
                  lastName: '',
                  email: '',
                  message: '',
                }}
                validateOnBlur={false}
                validateOnChange={false}
                validationSchema={toFormikValidationSchema(salesFormSchema)}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  await submitForm(
                    'xvojobaz',
                    values,
                    resetForm,
                    setSubmitting,
                    setThanks,
                    setOpen,
                  );
                }}
              >
                {({
                  isSubmitting,
                  touched,
                  setFieldTouched,
                  errors,
                  setFieldError,
                }) => (
                  <Form className="home-form mt-8">
                    <div className="grid grid-cols-6 items-center gap-x-4 gap-y-2">
                      <label className="col-span-3">First name</label>
                      <label className="col-span-3">Last name</label>
                      <CustomField
                        name="firstName"
                        type="text"
                        className="col-span-3"
                        placeholder="Harper"
                        disabled={isSubmitting}
                        touched={touched}
                        errors={errors}
                        setFieldError={setFieldError}
                        setFieldTouched={setFieldTouched}
                      />
                      <CustomField
                        name="lastName"
                        type="text"
                        className="col-span-3"
                        placeholder="Evans"
                        disabled={isSubmitting}
                        touched={touched}
                        errors={errors}
                        setFieldError={setFieldError}
                        setFieldTouched={setFieldTouched}
                      />
                      <label className="col-span-6">Company email</label>
                      <CustomField
                        name="email"
                        type="email"
                        className="col-span-6"
                        placeholder="harper.evans@globex.com"
                        disabled={isSubmitting}
                        touched={touched}
                        errors={errors}
                        setFieldError={setFieldError}
                        setFieldTouched={setFieldTouched}
                      />
                      <label className="col-span-6">Message</label>
                      <CustomField
                        name="message"
                        type="text"
                        as="textarea"
                        placeholder="Tell us about your needs and timeline"
                        className="col-span-6 h-40 min-h-[38px]"
                        disabled={isSubmitting}
                        touched={touched}
                        errors={errors}
                        setFieldError={setFieldError}
                        setFieldTouched={setFieldTouched}
                      />
                    </div>
                    <div className="mt-6 flex justify-end">
                      <FormSubmitButton isSubmitting={isSubmitting} />
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="mt-6 flex flex-row items-center gap-4 border-t border-neutral-900 pt-6">
                <p className="flex-grow text-xs text-neutral-500">
                  Want to see the product in action?
                </p>
                <a
                  href="https://calendly.com/markprompt/30min"
                  target="_blank"
                  rel="noreferrer"
                  className="home-border-button flex-none whitespace-nowrap"
                >
                  Book a demo
                </a>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="home-icon-button absolute top-3 right-3"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
