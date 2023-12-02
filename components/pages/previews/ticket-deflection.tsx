import { Button, Input, Label } from '../sections/home/shared';

export const TicketDeflection = () => {
  return (
    <div className="relative z-10 flex h-full flex-col gap-2 rounded-t-lg border-l border-t border-r border-neutral-200 bg-white p-4 text-neutral-900 shadow-2xl">
      <h2 className="text-bold text-sm font-bold">New ticket</h2>
      <Label>Describe your issue</Label>
      <Input>
        I am not able to find the cancellation policy if I can&apos;t attend a
        class I&apos;ve booked. Are there any penalties or fees if I can&apos;t
        attend a booked class?
      </Input>
      <Label>Suggested answer</Label>
      <div className="flex flex-col gap-2 rounded border border-lime-100 bg-lime-50 p-2 text-[9px] text-neutral-900">
        <p>Hello Joyce!</p>
        <p>
          The cancellation policy for a booked class may vary depending on the
          studio you are booking with. Generally, we allow you to cancel a class
          reservation without any penalty up to a certain time before the class
          starts. However, if you cancel within 24 hours of the class start
          time, you may be subject to a late cancellation fee. This fee is
          typically deducted from your credits or charged to your payment method
          on file.
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-row items-center justify-end gap-4 border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 text-[9px]">
        <p className="text-neutral-700">Did this not solve your issue?</p>
        <Button color="black">Create a ticket</Button>
      </div>
    </div>
  );
};
